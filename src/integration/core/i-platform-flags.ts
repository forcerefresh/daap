export interface IPlatformFlags {
  hasAccountUI: boolean;        // SAAS: Account + Development tabs in settings (login button is AccountComponent)
  hasLibraryMedia: boolean;     // SAAS: Library Images / Vectors / Masks tabs
  hasAiTextAssistant: boolean;  // SAAS: AI assistant button in TextToolbar
  hasLayoutsButton: boolean;    // SAAS: Extensions/Layouts button in header and toolbar
  hasHomeLinkInSearch: boolean; // SAAS: logo as a link + Home/Docs nav in search header
  hasWpSaveButton: boolean;     // WP: floppy-disk save button in ExportPanel
  hasWpHomePage: boolean;       // WP: home-page dropdown in AppSettingsPanel
  hasWpContainerClass: boolean; // WP: extra container CSS class applied in search page
  requiresAuth: boolean;               // SAAS: gate template load on isAuthenticated
  hasUserAccount: boolean;             // SAAS: loadUserData / /api/v1/me
  hasPendingTemplateRedirect: boolean; // SAAS: pending-template redirect spinner in search
}
