'use client';

import React, { useMemo } from 'react';

/** Wallet / pay icon (white) for primary Pay button */
export function InvoicePayWalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-cy="invoice-pay-wallet-icon"
      width={15}
      height={11}
      viewBox="0 0 15 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        data-cy="invoice-pay-wallet-icon-path"
        d="M12 6.66667V1.33333C12 0.6 11.4 0 10.6667 0H1.33333C0.6 0 0 0.6 0 1.33333V6.66667C0 7.4 0.6 8 1.33333 8H10.6667C11.4 8 12 7.4 12 6.66667ZM10.6667 6.66667H1.33333V1.33333H10.6667V6.66667ZM6 2C4.89333 2 4 2.89333 4 4C4 5.10667 4.89333 6 6 6C7.10667 6 8 5.10667 8 4C8 2.89333 7.10667 2 6 2ZM14.6667 2V9.33333C14.6667 10.0667 14.0667 10.6667 13.3333 10.6667H2C2 10 2 10.0667 2 9.33333H13.3333V2C14.0667 2 14 2 14.6667 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Card icon for dropdown (dark gray) */
export function InvoicePayCardMenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-cy="invoice-pay-card-menu-icon"
      width={16}
      height={14}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
      {...props}
    >
      <path
        data-cy="invoice-pay-card-menu-icon-path"
        d="M15.8333 0H0.00791666L0 13.3333H15.8333V0ZM14.25 11.6667H1.58333V6.66667H14.25V11.6667ZM14.25 3.33333H1.58333V1.66667H14.25V3.33333Z"
        fill="#323232"
      />
    </svg>
  );
}

const CHAPA_SVG_RAW = `<svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.59" d="M12.9462 9.71688H5.41167C4.60876 9.71688 3.9585 8.96615 3.9585 8.0392C3.9585 7.12458 4.60037 6.38354 5.39259 6.38354H15.8335C15.8335 8.22424 14.5406 9.71688 12.9462 9.71688Z" fill="url(#paint0_linear_13105_9840)"/>
<path opacity="0.59" d="M5.07499 1.59131C5.02254 1.59131 4.97085 1.59635 4.91992 1.60441C5.0233 1.59635 5.12668 1.59131 5.23158 1.59131H5.07499Z" fill="url(#paint1_linear_13105_9840)"/>
<path opacity="0.59" d="M15.4784 1.59131L13.3994 5.19843H16.1253C17.7133 5.19843 19.001 3.58319 19.001 1.59131H15.4784Z" fill="url(#paint2_linear_13105_9840)"/>
<path opacity="0.59" d="M9.88369 5.14313L11.9308 1.59131H5.23535C7.25888 1.59036 9.01331 3.03301 9.88369 5.14313Z" fill="url(#paint3_linear_13105_9840)"/>
<path d="M9.90575 5.19422C9.89815 5.1761 9.89207 5.15703 9.88446 5.13892L9.85254 5.19422H9.90575Z" fill="url(#paint4_linear_13105_9840)"/>
<path d="M5.12744 5.19702V5.20263C5.16013 5.20076 5.19205 5.19702 5.22474 5.19702H5.12744Z" fill="url(#paint5_linear_13105_9840)"/>
<path d="M11.9823 1.49354L11.9268 1.58985L9.87971 5.14167C9.88731 5.15978 9.8934 5.17885 9.901 5.19697H9.84779L9.18265 6.35167L7.02078 10.0723C6.58825 10.7054 5.9482 11.1087 5.23138 11.1087C3.92999 11.1087 2.8749 9.78525 2.8749 8.15285C2.8749 6.56144 3.8783 5.26753 5.13408 5.20364V5.19792H5.23138H9.84855L9.88047 5.14262C9.0101 3.03346 7.25642 1.5908 5.23214 1.5908H5.23138C5.12647 1.5908 5.02309 1.59557 4.91971 1.6032C2.17556 1.80629 0 4.66014 0 8.1538C0 11.7781 2.34279 14.7168 5.23214 14.7168C6.91131 14.7168 8.40426 13.7242 9.36129 12.1814L9.55209 11.8515L12.7318 6.35262L13.3969 5.19792L15.476 1.5908L15.9982 0.684966C14.7105 -0.483082 12.9127 -0.120749 11.9823 1.49354Z" fill="url(#paint6_linear_13105_9840)"/>
<defs>
<linearGradient id="paint0_linear_13105_9840" x1="-2.33193" y1="-4.95134" x2="42.1828" y2="29.2971" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint1_linear_13105_9840" x1="-2.12823" y1="-6.8822" x2="46.5742" y2="25.7592" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint2_linear_13105_9840" x1="2.06709" y1="-12.3513" x2="49.0753" y2="20.936" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint3_linear_13105_9840" x1="-0.577282" y1="-8.61572" x2="46.4309" y2="24.6716" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint4_linear_13105_9840" x1="-1.42667" y1="-7.41801" x2="45.5812" y2="25.8681" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint5_linear_13105_9840" x1="-3.51429" y1="-4.29691" x2="42.8824" y2="29.1993" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
<linearGradient id="paint6_linear_13105_9840" x1="-2.54052" y1="-5.84938" x2="44.4677" y2="27.4379" gradientUnits="userSpaceOnUse">
<stop stop-color="#86BD4C"/>
<stop offset="0.1381" stop-color="#81BD56"/>
<stop offset="0.3939" stop-color="#72BB71"/>
<stop offset="0.7363" stop-color="#55B996"/>
<stop offset="0.995" stop-color="#2EB8B4"/>
</linearGradient>
</defs>
</svg>`;

/** Chapa icon for dropdown; rewrites gradient ids so multiple instances stay valid. */
export function InvoicePayChapaMenuIcon() {
  const uid = React.useId().replace(/:/g, '');
  const markup = useMemo(() => {
    let s = CHAPA_SVG_RAW;
    for (let i = 0; i <= 6; i += 1) {
      const oldId = `paint${i}_linear_13105_9840`;
      const newId = `${uid}_chapa_g${i}`;
      s = s.split(oldId).join(newId);
    }
    return s;
  }, [uid]);

  return (
    <span
      data-cy="invoice-pay-chapa-menu-icon"
      className="inline-flex shrink-0 leading-none [&_svg]:block"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
