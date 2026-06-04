# 1. В src/plugins/flag.ts:
```ts
type FlagsPlugin = {
	show:		(options: FlagsModel) => void;
	success:	(message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => void;
	info:		(message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => void;
	warn:		(message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => void;
	error:		(message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => void;
}
export type FlagsModel = {
	id?: string;
	title?: string;
	message?: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	timeout?: number;
	autoclose?: boolean;
}
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$flags: FlagsPlugin;
	}
}
declare module '#app' {
  interface NuxtApp {
    $flags: FlagsPlugin;
  }
}


export default defineNuxtPlugin((nuxtApp) => {
	const flags: FlagsPlugin = {
		show: (params: FlagsModel) => {
			const appStore = useAppStore();
			if (appStore) {
				const id = params.id = params.id ?? Math.random().toString(36).substring(2, 9);
				appStore.flags.push(params);

				if(params.autoclose || params.autoclose === undefined && params.type !== 'error') {
					setTimeout(() => {
						appStore.flags = appStore.flags.filter(flag => flag.id !== id);
					}, params.timeout ?? 6000);
				}
			} else {
				console.warn('Метод $flag.show: Невозможно показать флаг, appStore еще не инициализирован');
			}
		},
		success: (message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => {
			flags.show({ type: 'success', message,  ...params });
		},
		info: (message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => {
			flags.show({ type: 'info',  message,  ...params });
		},
		warn: (message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => {
			flags.show({ type: 'warning',  message,  ...params });
		},
		error: (message: string, params?: Omit<FlagsModel, 'type' | 'message'>) => {
			flags.show({ type: 'error',  message,  ...params });
		},
	};

	nuxtApp.provide('flags', flags);
});
```

# 2. В components/common/FlagWrapper.vue
```vue
<template>
	<section class="flags" v-if="appStore.flags?.length">
		<TransitionGroup name="flag-list">
			<div v-for="flag of appStore.flags" :key="flag.id" class="flag">
				<div class="flag-icon">
					<BaseIcon :name="iconMap[flag.type ?? 'info'].name" :fill="iconMap[flag.type ?? 'info'].color"
						size="1.4em" />
				</div>
				<div class="flag-content">
					<h2 v-if="flag.title">{{ flag.title }}</h2>
					<p>{{ flag.message }}</p>
				</div>
				<div class="flag-close">
					<BaseIcon @click="removeFlag(flag.id!)" name="mdi-close" size="1.4em" />
				</div>
			</div>
		</TransitionGroup>
	</section>
</template>

<script setup lang="ts">
import BaseIcon from './base/BaseIcon.vue';

const appStore = useAppStore();

const removeFlag = (id: string) => {
	appStore.flags = appStore.flags.filter(flag => flag.id !== id);
};

const iconMap = {
	info: { name: 'mdi-information', color: '#0452c1' },
	error: { name: 'mdi-alert-circle', color: '#ff5530' },
	warning: { name: 'mdi-alert', color: '#ffaa00' },
	success: { name: 'mdi-check-circle', color: '#46ab80' },
};
</script>

<style lang="scss">
.flags {
	position: fixed;
	right: 1em;
	top: 1em;
	display: flex;
	flex-direction: column;
	gap: .6em;
	z-index: 99999;

	.flag {
		display: flex;
		gap: 1em;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: .6em 1em;
		border-radius: 4px;
		transition: all 200ms ease-out 0s;
		max-width: 400px;

		&:hover {
			background: rgba(255, 255, 255, 1);
			transition: all 200ms ease-out 0s;
		}

		.flag-icon {
			width: 40px;
			height: 40px;
			border-radius: 4px;
		}

		.flag-content {
			flex: auto 1 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: .2em;
			color: #333;

			h2 {
				margin: 0 0 .2em 0;
				font-size: 1.2em;
				font-weight: 600;
			}

			p {
				margin: 0;
				font-size: .9em;
			}
		}

		.flag-close {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 40px;
			height: 40px;
			// min-width: 40px;
			// min-height: 40px;
			// border-radius: 4px;
			// background: #ffffff;
			// backdrop-filter: blur(10px);
			// -webkit-backdrop-filter: blur(10px); /* For compatibility */
			// border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle light border */
			// box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow */
			cursor: pointer;

			&:hover {
				background: rgba(255, 255, 255, 1);
				transition: all 200ms ease-out 0s;
			}
		}
	}

	/* АНИМАЦИИ ДЛЯ ПЛАВНОГО ДОБАВЛЕНИЯ И СДВИГА СПИСКА */
	.flag-list-enter-from {
		opacity: 0;
		transform: translateX(30px);
	}

	.flag-list-leave-to {
		opacity: 0;
		transform: translateX(30px) scale(0.9);
	}

	.flag-list-enter-active,
	.flag-list-leave-active {
		transition: all 0.3s ease;
	}

	/* Обеспечивает плавное перемещение оставшихся тостов вверх при удалении одного из них */
	.flag-list-leave-active {
		position: absolute;
		/* Необходимо для корректной работы move-эффекта */
		width: 100%;
	}

	.flag-list-move {
		transition: transform 0.3s ease;
	}
}
</style>
```

# 3. В Pinia AppStore.ts
```ts
  flags: [] as FlagsModel[]
```

# 4. В app.vue
```vue
<FlagWrapper v-if="appStore.flags.length"/>
```
