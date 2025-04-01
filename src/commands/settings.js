// Handles add-in configuration
export async function openSettings(event) {
    Office.context.ui.displayDialogAsync(
      'https://yourdomain.com/settings',
      {
        height: 40,
        width: 30,
        promptBeforeOpen: false
      },
      result => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error(result.error.message);
        }
      }
    );
  
    event.completed();
  }