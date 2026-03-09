import type { App, Directive, DirectiveBinding } from 'vue';

export type ResizebleConfig = {
	width: number;
	min?: number;
	max?: number;
	side?: 'left' | 'right';
};

type ResizebleBindingValue = number | string | ResizebleConfig | undefined;

type ResizebleState = {
	handle: HTMLDivElement;
	params: ResizebleConfig;
	onMouseDown: (event: MouseEvent) => void;
	onMouseMove: (event: MouseEvent) => void;
	onMouseUp: () => void;
};

type ResizebleHTMLElement = HTMLElement & {
	__resizeble?: ResizebleState;
};

const DEFAULT_WIDTH = 300;
const DEFAULT_MIN = 200;
const DEFAULT_MAX = 1600;

const resolveParams = (bindingValue: ResizebleBindingValue): ResizebleConfig => {
	if (typeof bindingValue === 'number' && Number.isFinite(bindingValue)) {
		return { width: bindingValue };
	}
	if (typeof bindingValue === 'string') {
		const parsed = Number.parseInt(bindingValue, 10);
		return { width: Number.isFinite(parsed) ? parsed : DEFAULT_WIDTH };
	}
	if (typeof bindingValue === 'object' && bindingValue?.width !== undefined) {
		return bindingValue;
	}

	return { width: DEFAULT_WIDTH };
};

const setInitialWidth = (el: HTMLElement, params: ResizebleConfig) => {
	if (Number.isFinite(params.width)) {
		el.style.width = `${params.width}px`;
	}
};

const createDirectiveState = (
	el: ResizebleHTMLElement,
	binding: DirectiveBinding<ResizebleBindingValue>,
): ResizebleState => {
	const params = resolveParams(binding.value);

	const min = Number.isFinite(params.min) ? Number(params.min) : DEFAULT_MIN;
	const max = Number.isFinite(params.max) ? Number(params.max) : DEFAULT_MAX;
	const side = params.side ?? 'left';

	const handle = document.createElement('div');
	handle.className = 'v-resizeble-handle';
	handle.dataset.side = side;

	const onMouseMove = (event: MouseEvent) => {
		if (event.movementX === 0) {
			return;
		}

		const delta = side === 'left' ? -event.movementX : event.movementX;
		params.width = Math.max(min, Math.min(max, params.width + delta));
		el.style.width = `${params.width}px`;
	};

	const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		document.body.style.userSelect = '';
	};

	const onMouseDown = (event: MouseEvent) => {
		event.preventDefault();
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.body.style.userSelect = 'none';
	};

	handle.addEventListener('mousedown', onMouseDown);

	return {
		handle,
		params,
		onMouseDown,
		onMouseMove,
		onMouseUp,
	};
};

const destroyDirectiveState = (el: ResizebleHTMLElement) => {
	const state = el.__resizeble;
	if (!state) {
		return;
	}

	state.handle.removeEventListener('mousedown', state.onMouseDown);
	document.removeEventListener('mousemove', state.onMouseMove);
	document.removeEventListener('mouseup', state.onMouseUp);
	state.handle.remove();
	delete el.__resizeble;
};

export const resizebleDirective: Directive<ResizebleHTMLElement, ResizebleBindingValue> = {
	mounted(el, binding) {
		const computed = window.getComputedStyle(el);
		if (computed.position === 'static') {
			el.style.position = 'relative';
		}

		const state = createDirectiveState(el, binding);
		el.appendChild(state.handle);
		setInitialWidth(el, state.params);
		el.__resizeble = state;
	},

	updated(el, binding) {
		if (!el.__resizeble) {
			return;
		}

		const params = resolveParams(binding.value);
		el.__resizeble.params.width = params.width;
		setInitialWidth(el, el.__resizeble.params);
	},

	unmounted(el) {
		destroyDirectiveState(el);
	},
};

export const registerResizebleDirective = (app: App) => {
	app.directive('resizeble', resizebleDirective);
	// Алиас с корректным написанием, можно использовать оба варианта
	app.directive('resizable', resizebleDirective);
};




/*
.v-resizeble-handle {
	position: absolute;
	width: 1px;
	background: #f0f0f0;
	z-index: 99;
	top: 0;
	bottom: 0;
	height:100%;
	cursor: e-resize;
	border-radius: 3px;
	transition: all 100ms ease 0s;

	&[data-side='left'] {
		left: 0;
	}

	&[data-side='right'] {
		right: 0;
	}

	&:hover {
		background: #0079C2;
		width: 3px;
	}
}
*/