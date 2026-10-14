/**
 * Видимая часть экрана для мобильной раскладки.
 *
 * На iOS клавиатура не уменьшает страницу, а наезжает на неё, поэтому `100dvh` и `bottom: 0`
 * прячут нижнюю панель под клавиатуру. visualViewport знает реальную видимую высоту — кладём её
 * в CSS-переменные: `--app-height` (высота) и `--app-top` (сдвиг, если браузер прокрутил страницу
 * к полю ввода). На <html> ставится `data-keyboard="open"`, пока клавиатура открыта.
 */
/** Если видимая высота меньше максимальной на эту долю — значит, открыта клавиатура */
const KEYBOARD_RATIO = 0.8;

export function initVisualViewport(): () => void {
	const vv = window.visualViewport;
	const root = document.documentElement;
	if (!vv) return () => {};

	let fullHeight = Math.max(vv.height, window.innerHeight);
	let frame = 0;

	const update = () => {
		frame = 0;
		fullHeight = Math.max(fullHeight, vv.height);
		root.style.setProperty("--app-height", `${vv.height}px`);
		root.style.setProperty("--app-top", `${vv.offsetTop}px`);
		const keyboard = vv.height < fullHeight * KEYBOARD_RATIO;
		if (keyboard) root.dataset.keyboard = "open";
		else delete root.dataset.keyboard;
	};
	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	// Поворот экрана меняет «полную» высоту — считаем заново
	const onOrientation = () => {
		fullHeight = 0;
		schedule();
	};

	update();
	vv.addEventListener("resize", schedule);
	vv.addEventListener("scroll", schedule);
	window.addEventListener("orientationchange", onOrientation);
	return () => {
		cancelAnimationFrame(frame);
		vv.removeEventListener("resize", schedule);
		vv.removeEventListener("scroll", schedule);
		window.removeEventListener("orientationchange", onOrientation);
	};
}
