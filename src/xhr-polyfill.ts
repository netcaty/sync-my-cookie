class XMLHttpRequestPolyfill {
  private _method: string = '';
  private _url: string = '';
  private _headers: Record<string, string> = {};
  private _body: string | FormData | null = null;
  private _readyState: number = 0;
  private _status: number = 0;
  private _statusText: string = '';
  private _responseText: string = '';
  private _responseType: string = '';
  private _onreadystatechange: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null = null;
  private _onload: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null = null;
  private _onerror: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null = null;
  private _timeout: number = 0;

  open(method: string, url: string): void {
    this._method = method;
    this._url = url;
    this._readyState = 1;
    this._onreadystatechange?.(new Event('readystatechange'));
  }

  setRequestHeader(name: string, value: string): void {
    this._headers[name] = value;
  }

  send(body?: string | FormData | null): void {
    this._body = body ?? null;
    this._readyState = 2;
    this._onreadystatechange?.(new Event('readystatechange'));

    const controller = new AbortController();
    const timeoutId = this._timeout > 0 ? setTimeout(() => controller.abort(), this._timeout) : null;

    globalThis.fetch(this._url, {
      method: this._method,
      headers: this._headers,
      body: this._body as any,
      signal: controller.signal,
    })
      .then(async (response) => {
        this._status = response.status;
        this._statusText = response.statusText;
        this._readyState = 3;
        this._onreadystatechange?.(new Event('readystatechange'));

        this._responseType = this._responseType || 'text';
        if (this._responseType === 'text' || this._responseType === '') {
          this._responseText = await response.text();
        } else if (this._responseType === 'json') {
          this._responseText = JSON.stringify(await response.json());
        }

        this._readyState = 4;
        this._onreadystatechange?.(new Event('readystatechange'));
        this._onload?.(new Event('load'));
      })
      .catch((error) => {
        this._status = 0;
        this._statusText = error.name === 'AbortError' ? 'timeout' : 'error';
        this._readyState = 4;
        this._onreadystatechange?.(new Event('readystatechange'));
        this._onerror?.(new Event('error'));
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
  }

  abort(): void {
    this._readyState = 0;
    this._status = 0;
  }

  get readyState(): number { return this._readyState; }
  get status(): number { return this._status; }
  get statusText(): string { return this._statusText; }
  get responseText(): string { return this._responseText; }
  get responseType(): string { return this._responseType; }
  set responseType(value: string) { this._responseType = value; }
  get timeout(): number { return this._timeout; }
  set timeout(value: number) { this._timeout = value; }
  get onreadystatechange(): ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null { return this._onreadystatechange; }
  set onreadystatechange(value: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null) { this._onreadystatechange = value; }
  get onload(): ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null { return this._onload; }
  set onload(value: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null) { this._onload = value; }
  get onerror(): ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null { return this._onerror; }
  set onerror(value: ((this: XMLHttpRequestPolyfill, ev: Event) => void) | null) { this._onerror = value; }
}

(global as any).XMLHttpRequest = XMLHttpRequestPolyfill;
(self as any).XMLHttpRequest = XMLHttpRequestPolyfill;

export {};
