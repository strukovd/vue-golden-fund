# 1. В src/plugins:
```sh
touch popup.ts
```
В popup.ts:
```ts
import { useAppStore } from '@/store';
import { type App } from 'vue';


type PopupPlugin = {
	show: (popupOptions: PopupModel) => Promise<any>;
}
export type PopupModel = {
	items: PopupItem[];
	event: any;

	resolve?: (payload: any) => void;
	reject?: (payload: any) => void;
}
export type PopupItem = {
	key: string;
	name: string;
	fn: (image: any) => void;
	icon?: string;
	disabled?: boolean;
}
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$popup: PopupPlugin;
	}
}


const popupPlugin = {
	install(app: App) {
		const popup: PopupPlugin = {
			show: (popupOptions: PopupModel) => {
				return new Promise<any>((resolve, reject) => {
					const appStore = useAppStore();
					if (appStore) {
						console.log(popupOptions.event);

						appStore.popup = popupOptions;
					} else {
						console.warn('Метод $popup.show: Невозможно открыть контекстное меню, appStore еще не инициализирован');
					}
				});

			}
		};

		app.config.globalProperties.$popup = popup;
	}
};


export default popupPlugin;

```

## 1.2. В plugins/index.ts:
```ts
import popup from './popup';
// ..

// ..
	app
		.use(popup)
```

# 2. В components/common или другую
```sh
touch Popup.vue
```

В Popup.vue:
```ts
<template>
	<ul class="popup" v-if="appStore.popup"
		:style="{ left: appStore.popup.event.pageX + 'px', top: appStore.popup.event.pageY + 'px' }"
		@keydown.esc="close"
		@click.self="close">
		<li v-for="(item, index) of appStore.popup.items" :key="index" @click="item.fn(item)">
			<v-icon class="popup-icon" v-if="item.icon" color="#071b3eCC" :icon="item.icon" size="20"/>
			<span>{{ item.name }}</span>
		</li>
	</ul>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useAppStore } from '@/store';


export default {
	computed: {
		...mapStores(useAppStore),
	},
	props: { items: Array },
	methods: {
		onKeydown(e: KeyboardEvent) {
			if( e.key === 'Escape' ) {
				this.close(e);
			}
		},

		close(e: Event) {
			this.appStore.popup = null;
		},
	},
	created() {
		window.addEventListener('keydown', this.onKeydown);
		window.addEventListener('click', this.close);
	},
	beforeUnmount() {
		window.removeEventListener('keydown', this.onKeydown);
		window.removeEventListener('click', this.close);
	}
};
</script>

<style lang="scss">
.popup {
	position:absolute;
	list-style: none;
	border-radius:5px;
	box-shadow: 0 0 1em rgba(0,0,0,0.2);
	background:#fff;
	z-index:9999;

	li {
		display:flex;
		justify-content:start;
		align-items:center;
		gap:.6em;
		padding:.6em 1em;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&:first-child, &:last-child {
			border-radius:5px 5px 0 0;
		}

		&:not(:last-child) {
			border-bottom:1px solid #f6f6f6;
		}

		&:hover {
			background: #f6f6f6;
		}


		.popup-icon {

		}
	}
}
</style>

```



# 3. В Pinia AppStore.ts

Если нету файла AppStore.ts, создать его:
```bash
mkdir src/store
touch AppStore.ts
```

В AppStore.ts:
```ts
// ...
import type { PopupModel } from '@/plugins/popup';
// ...

// .. В секцию state:
popup: null as PopupModel | null,
// ..
```



# 4. В App.vue

В script:
```ts
import { mapStores } from 'pinia';
import { useAppStore } from './store/AppStore';
import Popup from './components/common/Popup.vue';
```

```ts
components: {
	Popup,
	// ... Остальные компоненты
},
computed: {
    ...mapStores(useAppStore),
	// ... Остальной код
}
```

В template, в основной контейнер добавить:
```html
<transition name="popup">
	<Popup v-if="appStore.popup"/>
</transition>
```

В styles:
```css
.popup-enter-active, .popup-leave-active {
	transition:opacity .2s ease-in 0s;
}
.popup-enter-from, .popup-leave-to {
	opacity: 0;
}
```

# 5. Использование
```html
<div @contextmenu.prevent="$popup.show({
	event:$event,
	items:
		tags.map(tag => {
			return {
				name: tag,
				icon: `mdi-tag`,
				fn: (item: any) => { file.tag = tag; selectedFiles = [...selectedFiles] }
			} as PopupItem;
		})
			.concat([
				{ name: 'Убрать тег', icon: 'mdi-tag-minus', fn: (item: any) => { delete file.tag; selectedFiles = [...selectedFiles]; } },
				{ name: 'Удалить', icon: 'mdi-delete', fn: deleteImage.bind(null, file) },
				{ name: 'Удалить все', icon: 'mdi-delete-alert', fn: deleteAll },
			] as PopupItem[])
})">
...
</div>
```

или в методе:
```ts
showPopup($event: any) {
	this.$popup.show({
		event:$event,
		items: [
			{ name: 'Редактировать', icon: 'mdi-home-group', fn: (item: any) => { return; } },
			{ name: 'Удалить', icon: 'mdi-home-group-remove', fn: ()=>{} },
			{ name: 'Добавить', icon: 'mdi-tag-minus', fn: (item: any) => { return; } },
		] as PopupItem[]
	});
}
```
