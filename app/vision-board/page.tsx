'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { VisionBoardImage } from '@/lib/types'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function VisionBoard() {
  const router = useRouter()
  const [images, setImages] = useState<VisionBoardImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<VisionBoardImage | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const { data: imagesData } = await supabase
      .from('vision_board_images')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (imagesData) {
      setImages(imagesData)
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - accept all image types
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.svg', '.tiff', '.tif', '.ico', '.avif']
    
    // Check if it's an image by MIME type or file extension
    if (!file.type.startsWith('image/') && !imageExtensions.includes(fileExtension)) {
      alert('Please select an image file.')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB. Please choose a smaller image.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setUploading(true)

    try {
      // Upload directly to Supabase Storage
      // If bucket doesn't exist or has permission issues, the upload will fail with a clear error
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vision-board')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        console.error('Full error object:', JSON.stringify(uploadError, null, 2))
        
        // Provide more specific error messages
        let errorMessage = 'Error uploading image. '
        const errorMsg = uploadError.message || String(uploadError)
        
        if (errorMsg.includes('Bucket not found') || errorMsg.includes('bucket')) {
          errorMessage += 'Storage bucket "vision-board" not found. Please create it in Supabase Storage settings and make it public.'
        } else if (errorMsg.includes('row-level security') || errorMsg.includes('RLS') || errorMsg.includes('policy')) {
          errorMessage += 'Storage policies not configured. Please set up storage policies in Supabase. See STORAGE_TROUBLESHOOTING.md for instructions.'
        } else if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          errorMessage += 'File already exists. Please try again with a different image.'
        } else if (errorMsg.includes('JWT') || errorMsg.includes('token') || errorMsg.includes('unauthorized')) {
          errorMessage += 'Authentication error. Please sign out and sign in again.'
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage += 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage += errorMsg || 'Please check your Supabase storage configuration. Check the browser console for details.'
        }
        
        alert(errorMessage)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vision-board')
        .getPublicUrl(fileName)

      // Save to database
      const { data: imageData, error: dbError } = await supabase
        .from('vision_board_images')
        .insert([{
          user_id: session.user.id,
          image_url: publicUrl
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Error saving image to database:', dbError)
        console.error('Full error object:', JSON.stringify(dbError, null, 2))
        
        // Try to delete the uploaded file if database insert fails
        try {
          await supabase.storage
            .from('vision-board')
            .remove([fileName])
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError)
        }
        
        let errorMessage = 'Error saving image. '
        const errorMsg = dbError.message || dbError.error || String(dbError)
        
        if (errorMsg.includes('row-level security') || errorMsg.includes('RLS') || errorMsg.includes('policy')) {
          errorMessage += 'Database policies not configured. Please run the schema.sql file in Supabase SQL Editor.'
        } else if (errorMsg.includes('JWT') || errorMsg.includes('token') || errorMsg.includes('unauthorized')) {
          errorMessage += 'Authentication error. Please sign out and sign in again.'
        } else {
          errorMessage += errorMsg || 'Please check your browser console for details.'
        }
        
        alert(errorMessage)
        setUploading(false)
        return
      } else {
        setImages([imageData, ...images])
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      console.error('Error stack:', error?.stack)
      
      let errorMessage = 'An unexpected error occurred. '
      if (error?.message) {
        errorMessage += error.message
      } else if (error?.error) {
        errorMessage += error.error
      } else {
        errorMessage += 'Please check your browser console for details.'
      }
      
      alert(errorMessage)
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const handleImageClick = (image: VisionBoardImage) => {
    setSelectedImage(image)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setShowDeleteConfirm(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!selectedImage) return

    const { error } = await supabase
      .from('vision_board_images')
      .delete()
      .eq('id', selectedImage.id)

    if (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image. Please try again.')
      setShowDeleteConfirm(false)
    } else {
      setImages(images.filter(img => img.id !== selectedImage.id))
      
      // Extract file path from URL and delete from storage
      try {
        const urlParts = selectedImage.image_url.split('/')
        const bucketIndex = urlParts.findIndex(part => part === 'vision-board')
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')
          await supabase.storage
            .from('vision-board')
            .remove([filePath])
        }
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue even if storage deletion fails
      }
      
      handleCloseModal()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center shadow-soft">
        <button
          onClick={() => router.back()}
          className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">Vision Board</h1>
      </div>

      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        {/* Main Content Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 text-center shadow-soft border border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-medium">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Your Vision Board</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 max-w-md mx-auto">
            Collect visuals that represent your goals, your energy, and your next chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
            <label className="inline-block bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 touch-manipulation min-h-[44px] w-full sm:w-auto">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="whitespace-nowrap flex items-center gap-2">
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Take Photo'
                )}
              </span>
            </label>
            <label className="inline-block bg-white text-gray-700 py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 touch-manipulation min-h-[44px] w-full sm:w-auto">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="whitespace-nowrap flex items-center gap-2">
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" color="pink" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Choose from Gallery'
                )}
              </span>
            </label>
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Image Gallery - Pinterest Style */}
        {images.length > 0 && (
          <>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Your Images ({images.length})</h3>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="relative mb-3 sm:mb-4 rounded-xl sm:rounded-2xl overflow-hidden shadow-medium hover:shadow-strong transition-all duration-200 cursor-pointer break-inside-avoid group"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="relative w-full">
                    <img
                      src={image.image_url}
                      alt="Vision board image"
                      className="w-full h-auto object-cover rounded-xl sm:rounded-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {images.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
            <p className="text-gray-500">Add your first image to get started on your vision board!</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 touch-manipulation group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage.image_url}
                alt="Vision board image"
                width={1200}
                height={1200}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                unoptimized
              />
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDeleteClick}
              className="absolute bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex items-center justify-center transition-all duration-200 touch-manipulation group shadow-lg hover:shadow-xl active:scale-95"
              title="Delete image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-strong">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Image?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 transition-all duration-200 touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong active:scale-95 hover:from-red-700 hover:to-red-800 transition-all duration-200 touch-manipulation"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
