import { orTranslate } from './openrouter';
export async function translateText(text, to){
  return await orTranslate({ text, target: to });
}
