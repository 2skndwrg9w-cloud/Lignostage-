export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
  blobUrl?: string;
}

export interface DriveFolderSearch {
  folderId?: string;
  folderName: string;
  photos: DriveFileItem[];
  videos: DriveFileItem[];
}

export const fetchLignostageMediaFromDrive = async (
  accessToken: string
): Promise<DriveFolderSearch> => {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Step 1: Find the "Lignostage" folder
  const folderQuery = encodeURIComponent(
    "mimeType = 'application/vnd.google-apps.folder' and name contains 'Lignostage' and trashed = false"
  );
  const folderRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name)&pageSize=10`,
    { headers }
  );

  let folderId: string | undefined;
  let folderName = 'Lignostage';

  if (folderRes.ok) {
    const folderData = await folderRes.json();
    if (folderData.files && folderData.files.length > 0) {
      folderId = folderData.files[0].id;
      folderName = folderData.files[0].name;
    }
  }

  // Step 2: Query for images and videos
  // If Lignostage folder was found, search inside it and its subfolders, or query all matching media
  let filesQuery = "(mimeType contains 'image/' or mimeType contains 'video/') and trashed = false";
  if (folderId) {
    // Also find subfolders of Lignostage (e.g. "bisherige Projekte")
    const subQuery = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const subRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${subQuery}&fields=files(id,name)`, { headers });
    const subData = subRes.ok ? await subRes.json() : { files: [] };
    const allFolderIds = [folderId, ...(subData.files || []).map((f: any) => f.id)];
    
    const parentConditions = allFolderIds.map((id) => `'${id}' in parents`).join(' or ');
    filesQuery = `(${parentConditions}) and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`;
  }

  const encodedFilesQuery = encodeURIComponent(filesQuery);
  const filesRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodedFilesQuery}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,createdTime,size)&pageSize=50`,
    { headers }
  );

  if (!filesRes.ok) {
    throw new Error(`Fehler beim Laden von Google Drive: ${filesRes.statusText}`);
  }

  const data = await filesRes.json();
  const rawFiles: any[] = data.files || [];

  const photos: DriveFileItem[] = [];
  const videos: DriveFileItem[] = [];

  for (const item of rawFiles) {
    const fileItem: DriveFileItem = {
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      thumbnailLink: item.thumbnailLink,
      webContentLink: item.webContentLink,
      webViewLink: item.webViewLink,
      createdTime: item.createdTime,
      size: item.size,
    };

    if (item.mimeType.startsWith('image/')) {
      photos.push(fileItem);
    } else if (item.mimeType.startsWith('video/')) {
      videos.push(fileItem);
    }
  }

  return {
    folderId,
    folderName,
    photos,
    videos,
  };
};

/**
 * Loads an image from Google Drive as a local object URL blob
 * with authorization header, avoiding CORS/permission restrictions
 */
export const loadDriveImageBlob = async (fileId: string, accessToken: string): Promise<string> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Foto konnte nicht aus Google Drive geladen werden');
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
