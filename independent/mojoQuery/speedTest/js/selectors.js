
window.relativeSelectors = [

'html',

'body', 

'div', 
			
'div p', 
			
'div div',

'div ~ p', 
			
'div ~ div ~ p',
			
'div > p', 

'div > p > p',
			
'div + p', 

'div + div + p',
			
'div p a', 

'div, p, a',

'div, div, div',

'.box .w-button',

'.box .pg .pg-bar',

'body #view',

'#view',

'div#view',
'#view.go',
'a#view'

];

window.clsSelectors = [

'.note',

'div.example', 
			
'ul .tocline2', 
			
'div.example, div.note', 

'.url.fn',

'.fn.url', 
			
'ul.toc li.tocline2', 
			
'ul.toc > li.tocline2',

'.w-button',
'.inline',
'.inline-block.w-button',
'.inline-blockw-button'

];

window.attrSelectors = [

'a[href][name][class]', 
			
'div[class]', 
			
'div[class=example]', 
			
'div[class^=exa]', 
			
'div[class$=mple]', 
			
'div[class*=e]', 
			
'a[name|=gen]', 
			
'div[class!=made_up]',
			
'div[class^=exa][class$=mple]',
			
'div[class~=example]'

];

window.pseuSelectors = [

'p:nth-child(even)',

'p:nth-child(odd)', 


'p:nth-child(2n)',


'p:nth-child(3n)',

			
'p:nth-child(n-4)',


'p:nth-child(2n+1)',

			
'p:nth-child(-2n+2)', 


'p:nth-child(-n+6)',

			
'p:nth-child(0n+2)',

			
'p:nth-child(5)',

			
'p:only-child', 

			
'p:last-child', 


'p:first-child',


'p:empty'
];

window.extraSelectors = [

'p:nth-last-child(even)',
'p:nth-of-type(even)',
'p:nth-last-of-type(even)',

'p:nth-last-child(odd)',
'p:nth-of-type(odd)',
'p:nth-last-of-type(odd)',

'p:nth-last-child(2n)',
'p:nth-of-type(2n)',
'p:nth-last-of-type(2n)',

'p:nth-last-child(3n)',
'p:nth-of-type(3n)',
'p:nth-last-of-type(3n)',

'p:nth-last-child(n-4)',
'p:nth-of-type(n-4)',
'p:nth-last-of-type(n-4)',

'p:nth-last-child(2n+1)',
'p:nth-of-type(2n+1)',
'p:nth-last-of-type(2n+1)',

'p:nth-last-child(-2n+2)',
'p:nth-of-type(-2n+2)',
'p:nth-last-of-type(-2n+2)',

'p:nth-last-child(-n+6)',
'p:nth-of-type(-n+6)',
'p:nth-last-of-type(-n+6)',

'p:nth-last-child(0n+2)',
'p:nth-of-type(0n+2)',
'p:nth-last-of-type(0n+2)',

'p:nth-last-child(5)',
'p:nth-of-type(5)',
'p:nth-last-of-type(5)',

'p:only-of-type', 

'p:last-of-type',

'p:first-of-type',

'div:not(.example)', 
			
'div:not(:nth-child(odd))',
			
'*:not(#title)',

'*:not([class])',

'div:has(p)',

'*:has(a > p)',

'*:contains(aa)',

'p:first',

'p:last',

'div div :even',

'div div :odd',

'div p:nth(even)',
'div p:nth(odd)',
'div p:nth(2n)',
'div p:nth(-n+5)',
'div p:nth(0n+2)'
			
]; 

window.crazySelectors = [

'div + div, div ~ div, div',

'div ~ div, div',

'div + *',

'div > div, div + div, div ~ div',

'div:not(:not(.example))',

'div.example',
			
'div:not(:not(:not(.example)))',

'div:not(.example)',

'div:not(a, p)',

'*:has(:not(a, p))',

'*',

'* div *',

'* > * + * ~ *',

'*.fn.url, .example.example'

];

window.customSelectors = [
'div#view',
'#view.go',
'a#view',

'.box .w-button',

'.box .pg .pg-bar',

'body #view',

'.inline',
'*.fn.url',
'.inline-block.w-button',
'.inline-blockw-button',
'.example.example'
];

window.allSelectors = relativeSelectors.concat(clsSelectors).concat(attrSelectors).concat(pseuSelectors);

// default loaded selectors
window.selectors = relativeSelectors;
