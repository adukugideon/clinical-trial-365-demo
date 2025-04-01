import { generateReview } from './generateReview';
import { quickAnalyze } from './quickAnalyze';
import { insertTemplate } from './insertTemplate';
import { openSettings } from './settings';

// Central command registration
const commands = {
  'generateReview': generateReview,
  'quickAnalyze': quickAnalyze,
  'insertTemplate.systematic': insertTemplate,
  'insertTemplate.meta': insertTemplate,
  'openSettings': openSettings
};

export function executeCommand(event) {
  const handler = commands[event.source.id];
  if (handler) {
    handler(event);
  } else {
    event.completed();
  }
}