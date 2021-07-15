import { merge } from 'lodash-es';
import { registerModal } from '../store/plugins/modals';
import AlertModal from '../components/AlertModal.vue';
import ImageGallery from '../components/ImageGallery.vue';
import UserPopup from '../components/UserPopup.vue';
import FeedItemMenu from '../components/FeedItemMenu.vue';
import TokenSelect from '../components/TokenSelect.vue';
import TipInputPopup from '../components/TipInputPopup.vue';
import CookiesDialog from '../components/CookiesDialog.vue';
import ErrorReportModal from '../components/ErrorReportModal.vue';
import ErrorReportSubmittedModal from '../components/ErrorReportSubmittedModal.vue';

export default () => {
  registerModal({ name: 'success', component: AlertModal, allowRedirect: true });
  registerModal({
    name: 'failure',
    component: {
      functional: true,
      render: (h, context) => h(AlertModal, merge({}, context, { props: { failure: true } })),
    },
    allowRedirect: true,
  });
  registerModal({
    name: 'image-gallery',
    component: ImageGallery,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'user-popup',
    component: UserPopup,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'feed-item-menu',
    component: FeedItemMenu,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'token-select',
    component: TokenSelect,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'tip-input-popup',
    component: TipInputPopup,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'cookies-dialog',
    component: CookiesDialog,
    resolveNullOnRedirect: true,
  });
  registerModal({
    name: 'error-report-modal',
    component: ErrorReportModal,
    allowRedirect: true,
  });
  registerModal({
    name: 'error-report-submitted-modal',
    component: ErrorReportSubmittedModal,
    allowRedirect: true,
  });
};
