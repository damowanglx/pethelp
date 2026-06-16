<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';

onLaunch(() => {
  const userStore = useUserStore();
  userStore.checkLogin();
});

onShow(() => {});

onHide(() => {});
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/reset.scss';

page {
  background-color: $bg-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
