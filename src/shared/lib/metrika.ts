import { YANDEX_METRIKA_CONFIG } from "@/shared/config/metrika";

export const initYandexMetrika = (): void => {
	if (import.meta.env.PROD && YANDEX_METRIKA_CONFIG.METRIKA_ID) {
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.innerHTML = `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_CONFIG.METRIKA_ID}', 'ym');

            ym(${YANDEX_METRIKA_CONFIG.METRIKA_ID}, 'init', {
                webvisor:${YANDEX_METRIKA_CONFIG.SETTINGS.webvisor},
                clickmap:${YANDEX_METRIKA_CONFIG.SETTINGS.clickmap},
                accurateTrackBounce:${YANDEX_METRIKA_CONFIG.SETTINGS.accurateTrackBounce},
                trackLinks:${YANDEX_METRIKA_CONFIG.SETTINGS.trackLinks}
            });
        `;

		document.head.appendChild(script);

		const noscript = document.createElement("noscript");
		noscript.innerHTML = `
			<div><img src="https://mc.yandex.ru/watch/${YANDEX_METRIKA_CONFIG.METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div>
		`;
		document.body.appendChild(noscript);
	}
};
