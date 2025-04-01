// import { initializeIcons } from '@fluentui/react/lib/Icons';
// import { App } from './taskpane/App'; // Only if using React

Office.onReady(() => {
  initializeIcons();
  
  // If using plain JS
  if (!window.reviewApp) {
    window.reviewApp = new ClinicalReviewApp();
  }
});

// class ClinicalReviewApp {
//   constructor() {
//     this.initUI();
//     this.bindEvents();
//   }
  
//   initUI() {
//     // Initialization logic if not using React
//   }
  
//   bindEvents() {
//     // Global event bindings
//   }
// }