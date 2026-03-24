 const REDIRECT_KEY = "community_redirect_url";
 
 export function saveRedirectUrl(url: string): void {
   localStorage.setItem(REDIRECT_KEY, url);
 }
 
 export function getAndClearRedirectUrl(): string | null {
   const url = localStorage.getItem(REDIRECT_KEY);
   if (url) {
     localStorage.removeItem(REDIRECT_KEY);
   }
   return url;
 }
 
 export function hasRedirectUrl(): boolean {
   return localStorage.getItem(REDIRECT_KEY) !== null;
 }
 
 export function clearRedirectUrl(): void {
   localStorage.removeItem(REDIRECT_KEY);
 }