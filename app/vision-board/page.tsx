'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { VisionBoardImage } from '@/lib/types'
import Image from 'next/image'

export default function VisionBoard() {
  const router = useRouter()
  const [images, setImages] = useState<VisionBoardImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
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
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vision-board')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        alert('Error uploading image. Please try again.')
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
        console.error('Error saving image:', dbError)
        alert('Error saving image. Please try again.')
      } else {
        setImages([imageData, ...images])
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const deleteImage = async (imageId: string, imageUrl: string) => {
    const { error } = await supabase
      .from('vision_board_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image. Please try again.')
    } else {
      setImages(images.filter(img => img.id !== imageId))
      
      // Extract file path from URL and delete from storage
      try {
        const urlParts = imageUrl.split('/')
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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 animate-pulse"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center shadow-soft">
        <button
          onClick={() => router.back()}
          className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vision Board</h1>
      </div>

      <div className="px-6 pt-6 max-w-4xl mx-auto">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-8 mb-6 text-center shadow-soft border border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 mx-auto mb-6 flex items-center justify-center shadow-medium">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your Vision Board</h2>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Collect visuals that represent your goals, your energy, and your next chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <label className="inline-block bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 px-6 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong hover:from-pink-700 hover:to-pink-800 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {uploading ? 'Uploading...' : 'Take Photo'}
            </label>
            <label className="inline-block bg-white text-gray-700 py-3.5 px-6 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {uploading ? 'Uploading...' : 'Choose from Gallery'}
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

        {/* Image Gallery */}
        {images.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Images ({images.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-square rounded-2xl overflow-hidden shadow-medium hover:shadow-strong transition-all duration-200 group">
                  <Image
                    src={image.image_url}
                    alt="Vision board image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => deleteImage(image.id, image.image_url)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
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
    </div>
  )
}
