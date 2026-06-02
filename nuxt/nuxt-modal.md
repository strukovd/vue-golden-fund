# 1. В src/plugins/modal.ts:
```ts
type ModalPlugin = {
	show: (template: string, options?: ModalOptions) => Promise<any>;
	close: () => void;
	closeAll: () => void;
}
export type ModalModel = {
	template: string;
	options?: ModalOptions;

	resolve?: (payload: any) => void;
	reject?: (payload: any) => void;
}
export type ModalOptions = {
	title?: string;
	payload?: any;
	icon?: string;
	nonCloseable?: boolean;
}
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$modal: ModalPlugin;
	}
}
declare module '#app' {
  interface NuxtApp {
    $modal: ModalPlugin;
  }
}


export default defineNuxtPlugin((nuxtApp) => {
	const modal: ModalPlugin = {
		show: (template: string, options?: ModalOptions) => {
			return new Promise<any>((resolve, reject) => {
			const appStore = useAppStore();
			if (appStore) {
				appStore.modals.push({
				template,
				options,
				resolve,
				reject
				});
			} else {
				console.warn('Метод $modal.show: Невозможно открыть модальное окно, appStore еще не инициализирован');
			}
			});

		},

		close: () => {
			const appStore = useAppStore();
			if (appStore) {
			const modal = appStore.modals.pop();
			if(modal && modal.resolve) modal?.resolve(true);
			} else {
			console.warn('Метод $modal.close: Невозможно закрыть модальное окно, appStore еще не инициализирован');
			}
		},

		closeAll: () => {
			const appStore = useAppStore();
			if (appStore) {
			appStore.modals = [];
			} else {
			console.warn('Метод $modal.closeAll: Невозможно закрыть модальные окна, appStore еще не инициализирован');
			}
		}
	};

	nuxtApp.provide('modal', modal);
});
```

# 2. В components/modals/ModalWrapper.vue
```
<template>
	<div class="modal-shadow" @keydown.esc="close" @click.self="close">
		<div class="modal-window glass">
			<header v-if="visibleModal.options?.title" class="modal-header">
				<h3>
					<!-- TODO: <v-icon v-if="visibleModal.options?.icon" color="cornflowerblue" :icon="visibleModal.options?.icon" size="1.2em"/> -->
					<span class="title">{{ visibleModal.options.title }}</span>
				</h3>
			</header>
			<nav></nav>
			<main class="main">
				<component v-if="modalComponent" :is="modalComponent" :payload="visibleModal.options?.payload"></component>
			</main>
			<footer class="footer"></footer>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

const appStore = useAppStore();
const visibleModal = computed(() => appStore.modals[appStore.modals.length-1] ?? {});
const modalLoaders = import.meta.glob('./*.vue');
const modalComponentCache = new Map<string, ReturnType<typeof defineAsyncComponent>>();

function resolveModalComponent(template?: string) {
	if (!template) return null;
	const cached = modalComponentCache.get(template);
	if (cached) return cached;

	const candidates = [
		`./${template}.vue`,
		`./${template}Modal.vue`
	];
	const loaderKey = candidates.find((candidate) => candidate in modalLoaders);
	if (!loaderKey) return null;

	const component = defineAsyncComponent(modalLoaders[loaderKey] as () => Promise<any>);
	modalComponentCache.set(template, component);
	return component;
}
const modalComponent = computed(() => resolveModalComponent(visibleModal.value?.template));

function onKeydown(e: KeyboardEvent) {
	if( e.key === 'Escape' ) {
		close(e);
	}
}

function close(e: Event) {
	if( !visibleModal.value?.options?.nonCloseable ) {
		appStore.modals.pop();
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown);
});
</script>

<style lang="scss">
.modal-shadow {
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	height:100vh;
	display: flex;
	transition:background-color 200ms ease-out 0s;
	background-color: rgb(20 33 51 / 10%);
	z-index:9999999;

	.modal-window {
		min-width:600px;
		max-width: 800px;
		margin:auto;
		// background: white;
		border-radius:6px;

		.modal-header {
			border-radius:6px 6px 0 0;
			// color: #656565;
			border-bottom: 1px solid #ffffff30;
			// background: #f5f5f5;

			h3 {
				line-height: 3em;
				margin: 0 1em;
				font-size: 1.2em;

				.title {
				vertical-align:middle;
				margin-left:.6em;
				}
			}
		}

		.main {
			padding:.6em 1.8em 1em;
			// overflow: auto;
			max-height: 90vh;
		}
	}
}
</style>
```

# 2.1 В components/modals/ConfirmModal.vue
```ts
<template>
	<div class="confirm-modal">
		<main v-if="payload" class="content">
			<h2 v-if="payload.options?.title" class="title">{{ payload.options.title }}</h2>
			<p v-if="payload.description" class="description">{{ payload.description }}</p>
		</main>
		<footer class="footer">
			<div class="buttons">
				<BaseButton prependIcon="mdi-check" @click="confirm" @keyup.enter="confirm">Да</BaseButton>
				<BaseButton prependIcon="mdi-close" @click="close" variant="secondary" @keyup.escape="close">Отмена</BaseButton>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
import BaseButton from '../common/base/BaseButton.vue';

const props = defineProps({
	payload: Object
});

function confirm() {
	const appStore = useAppStore();
	if (appStore) {
		const modal = appStore.modals.pop();
		if(modal && modal.resolve) modal?.resolve(true);
	}
}

function close() {
	const appStore = useAppStore();
	if (appStore) {
		const modal = appStore.modals.pop();
		if(modal && modal.resolve) modal?.resolve(false);
	}
}
</script>

<style lang="scss">
.confirm-modal {
	.content {
		padding:0 0 1.6em 0;

		.title {
		padding:0 0 .2em 0;
		margin:0 0 .2em 0;
		font-weight: 300;
		line-height: 1.3em;
		text-align:center;
		border-bottom:1px solid #46587c25;
		}
		.description {
		color:#46587c;
		text-align:center;
		white-space: pre-wrap;
		}
	}
	.footer {
		.buttons {
		// margin:1.6em 0 0 0;
		display: flex;
		gap: .4em;
		justify-content: flex-end;
		}
	}
}
</style>
```

3. В Pinia AppStore.ts
```ts
// ...
import { ModalModel } from '@/plugins/modal';
// ...

// .. В секцию state:
modals: [] as ModalModel[],
// ..
```

# 4. В App.vue
```ts
<transition name="modal">
	<ModalWrapper v-if="appStore.modals.length"/>
</transition>
```

