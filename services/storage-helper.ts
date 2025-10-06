// Lightweight dynamic storage helper to keep firebase storage out of the main bundle.
// This module is dynamically imported by the client when uploads are needed.
export type UploadController = {
  promise: Promise<string>; // resolves to download URL
  cancel: () => void;
};

export async function uploadFileToStaging(userId: string, file: File, onProgress?: (percent: number) => void): Promise<UploadController> {
  const mod = await import('firebase/storage');
  const getStorage = (mod as any).getStorage;
  const storageRef = (mod as any).ref;
  const uploadBytesResumable = (mod as any).uploadBytesResumable;
  const getDownloadURL = (mod as any).getDownloadURL;

  const storage = getStorage();
  const path = `staging_uploads/${userId}/${Date.now()}_${file.name}`;
  const ref = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(ref, file as any);

  const promise = new Promise<string>((resolve, reject) => {
    uploadTask.on('state_changed', (snapshot: any) => {
      const percent = snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
      if (onProgress) onProgress(percent);
    }, (err: any) => {
      reject(err);
    }, async () => {
      try {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      } catch (e) {
        reject(e);
      }
    });
  });

  return {
    promise,
    cancel: () => {
      try { (uploadTask as any).cancel && (uploadTask as any).cancel(); } catch (e) { console.warn('cancel not available', e); }
    }
  };
}

export default { uploadFileToStaging };
