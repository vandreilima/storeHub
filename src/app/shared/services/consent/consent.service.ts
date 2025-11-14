import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConsentService {
  private readonly STORAGE_KEY = 'store_hub_consent';

  private _consentGiven = signal<boolean>(false);
  private _analyticsConsent = signal<boolean>(false);
  private _showBanner = signal<boolean>(false);

  readonly consentGiven = this._consentGiven.asReadonly();
  readonly analyticsConsent = this._analyticsConsent.asReadonly();
  readonly showBanner = this._showBanner.asReadonly();

  readonly canLoadAnalytics = computed(
    () => this._consentGiven() && this._analyticsConsent()
  );

  constructor() {
    this.loadConsentFromStorage();
  }

  public acceptAll(): void {
    this._consentGiven.set(true);
    this._analyticsConsent.set(true);
    this._showBanner.set(false);
    this.saveConsent();
    this.loadAnalyticsScripts();
  }

  public acceptEssentialOnly(): void {
    this._consentGiven.set(true);
    this._analyticsConsent.set(false);
    this._showBanner.set(false);
    this.saveConsent();
  }

  public revokeConsent(): void {
    this._consentGiven.set(false);
    this._analyticsConsent.set(false);
    this._showBanner.set(true);
    this.clearConsent();
    this.removeAnalyticsScripts();
  }

  public checkConsentStatus(): void {
    const consent = this.getStoredConsent();

    if (!consent) {
      this._showBanner.set(true);
    } else {
      if (this.canLoadAnalytics()) {
        this.loadAnalyticsScripts();
      }
    }
  }

  private loadAnalyticsScripts(): void {
    if (this.isAnalyticsLoaded()) {
      return;
    }

    this.loadClarityScript();
  }

  private loadClarityScript(): void {
    const clarityId = 'YOUR_CLARITY_ID'; // TODO pensar em uma forma para todos conseguir ver esse teste rodando com o clarity

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `;
    script.setAttribute('data-consent', 'analytics');
    document.head.appendChild(script);
  }

  private removeAnalyticsScripts(): void {
    const scripts = document.querySelectorAll(
      'script[data-consent="analytics"]'
    );
    scripts.forEach((script) => script.remove());

    this.clearAnalyticsCookies();
  }

  private clearAnalyticsCookies(): void {
    // Clarity cookies
    const claritycookies = [
      '_clck',
      '_clsk',
      'CLID',
      'ANONCHK',
      'MR',
      'MUID',
      'SM',
    ];

    claritycookies.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    });
  }

  private isAnalyticsLoaded(): boolean {
    return document.querySelector('script[data-consent="analytics"]') !== null;
  }

  private saveConsent(): void {
    const consent = {
      consentGiven: this._consentGiven(),
      analyticsConsent: this._analyticsConsent(),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
  }

  private loadConsentFromStorage(): void {
    const consent = this.getStoredConsent();

    if (consent) {
      this._consentGiven.set(consent.consentGiven);
      this._analyticsConsent.set(consent.analyticsConsent);
      this._showBanner.set(false);
    }
  }

  private getStoredConsent(): ConsentData | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  private clearConsent(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

interface ConsentData {
  consentGiven: boolean;
  analyticsConsent: boolean;
  timestamp: string;
}
