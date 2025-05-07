# 1. В src/plugins:
```sh
touch modal.ts
```
В modal.ts:
```ts
import { useAppStore } from '@/store';
import { App } from 'vue';


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
  title: string;
  payload?: any;
  icon?: string;
  nonCloseable?: boolean;
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $modal: ModalPlugin;
  }
}


const modalPlugin = {
  install(app: App) {
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

    app.config.globalProperties.$modal = modal;
  }
};


export default modalPlugin;
```

## 1.2. В index.ts:
```ts
import modal from './modal';
// ..

// ..
	app
		.use(modal)
```



# 2. В components
## 2.1. В src/components/common
```bash
touch src/components/common/ModalWrapper.vue
```

<kbd>src/components/common/ModalWrapper.vue</kbd>
```html [src/components/common/ModalWrapper.vue]
<template>
  <div class="modal-shadow" @keydown.esc="close" @click.self="close">
    <div class="modal-window">
      <header class="modal-header">
        <h3>
          <!-- TODO: <v-icon v-if="visibleModal.options?.icon" color="cornflowerblue" :icon="visibleModal.options?.icon" size="1.2em"/> -->
          <span v-if="visibleModal.options?.title" class="title">{{ visibleModal.options.title }}</span>
        </h3>
      </header>
      <nav></nav>
      <main class="main">
        <component :is="visibleModal.template" :payload="visibleModal.options?.payload"></component>
      </main>
      <footer class="footer"></footer>
    </div>
  </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useAppStore } from '@/store';
import Confirm from '@/components/modals/ConfirmModal.vue';


export default {
  computed: {
    ...mapStores(useAppStore),
    visibleModal() {
      return this.appStore.modals[this.appStore.modals.length-1];
    }
  },
  components: { Confirm },
  methods: {
    onKeydown(e: KeyboardEvent) {
      if( e.key === 'Escape' ) {
        this.close(e);
      }
    },

    close(e: Event) {
      if( !this.visibleModal?.options?.nonCloseable ) {
        this.appStore.modals.pop();
      }
    },
  },
  created() {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  }
};
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
  background-color: rgb(20 33 51 / 60%);
  z-index:9999999;

  .modal-window {
    min-width:600px;
    max-width: 800px;
    margin:auto;
    background: white;
    border-radius:6px;

    .modal-header {
      border-radius:6px 6px 0 0;
      // color: #656565;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f5f5;

      h3 {
        line-height: 3em;
        margin: 0 1em;
        font-size: 17px;
        font-weight: 500;

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

## 2.2. В src/components/modals (необязательный пример)
```bash
touch src/components/modals/ConfirmModal.vue.vue
```

<kbd>src/components/modals/ConfirmModal.vue.vue</kbd>
```html [src/components/modals/ConfirmModal.vue.vue]
<template>
  <div class="confirm-modal">
    <main class="content">
      <h2 v-if="payload.options?.title" class="title">{{ payload.options.title }}</h2>
      <p class="description">{{ payload.description }}</p>
    </main>
    <footer class="footer">
      <div class="buttons">
        <BaseButton prependIcon="mdi-check" @click="confirm" @keyup.enter="confirm">Да</BaseButton>
        <BaseButton prependIcon="mdi-close" @click="close" :secondary="true" @keyup.escape="close">Отмена</BaseButton>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['payload'],
  data() {
    return {};
  },
  methods: {
    confirm() {
      const appStore = useAppStore();
      if (appStore) {
        const modal = appStore.modals.pop();
        if(modal && modal.resolve) modal?.resolve(true);
      }
    },

    close() {
      const appStore = useAppStore();
      if (appStore) {
        const modal = appStore.modals.pop();
        if(modal && modal.resolve) modal?.resolve(false);
      }
    }
  },
});
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



# 3. В Pinia AppStore.ts

Если нету файла AppStore.ts, создать его:
```bash
mkdir src/store
touch AppStore.ts
```

В AppStore.ts:
```ts
// ...
import { ModalModel } from '@/plugins/modal';
// ...

// .. В секцию state:
modals: [] as ModalModel[],
// ..
```



# 4. В App.vue

В script:
```ts
import { mapStores } from 'pinia';
import { useAppStore } from './store/AppStore';
```

```ts
computed: {
    ...mapStores(useAppStore),
// Остальной код
```

В template, в основной контейнер (в самый врех) добавить:
```html
<transition name="modal">
	<ModalWrapper v-if="appStore.modals.length"/>
</transition>
```

В styles:
```css
.modal-enter-active, .modal-leave-active {
  transition:opacity .2s ease-in 0s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
```