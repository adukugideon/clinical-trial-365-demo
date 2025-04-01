
Office.onReady(() => {
  initializeIcons();
  
  // If using plain JS
  if (!window.reviewApp) {
    window.reviewApp = new ClinicalReviewApp();
  }
});

