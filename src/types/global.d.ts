export { };

declare global {
    interface Window {
        electron?: {
            selectFolder: () => Promise<string | null>;
            openPath: (path: string) => Promise<string>;
            showItemInFolder: (path: string) => void;
            saveAndOpenPdf: (base64: string, fileName: string) => Promise<{ success: boolean; path?: string; error?: string }>;
            platform: string;
        };
    }
}
