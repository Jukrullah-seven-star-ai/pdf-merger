export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string; // Optional URL if we render previews later
}

export interface MergeResult {
  blob: Blob;
  fileName: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}
