import { storage } from './firebase'
import type {
  FirebaseStorage,
  StorageReference,
  UploadTask,
  UploadResult
} from 'firebase/storage'

export { storage }
export type { FirebaseStorage, StorageReference, UploadTask, UploadResult }

export const storageUtils = {
  getRef: (path: string) => {
    return import('firebase/storage').then(({ ref }) => ref(storage, path))
  },

  uploadFile: (path: string, file: File) => {
    return import('firebase/storage').then(({ ref, uploadBytes }) => {
      const storageRef = ref(storage, path)
      return uploadBytes(storageRef, file)
    })
  },

  uploadFileResumable: (path: string, file: File) => {
    return import('firebase/storage').then(({ ref, uploadBytesResumable }) => {
      const storageRef = ref(storage, path)
      return Promise.resolve(uploadBytesResumable(storageRef, file))
    })
  },

  getDownloadURL: (path: string) => {
    return import('firebase/storage').then(({ ref, getDownloadURL }) => {
      const storageRef = ref(storage, path)
      return getDownloadURL(storageRef)
    })
  },

  deleteFile: (path: string) => {
    return import('firebase/storage').then(({ ref, deleteObject }) => {
      const storageRef = ref(storage, path)
      return deleteObject(storageRef)
    })
  }
}
