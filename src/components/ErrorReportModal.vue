<template>
  <Dialog
    class="error-report-modal"
    :title="$t('reportBug.Title')"
    :subtitle="$t('reportBug.SubTitle')"
    @close="resolve(false)"
  >
    <img
      slot="icon"
      src="../assets/iconCodeError.svg"
    >

    {{ $t('reportBug.Description') }}

    <ButtonPlain
      class="toggle-details"
      @click="details = !details"
    >
      <IconRightArrow :class="{ open: details }" />
      &nbsp;<span>{{ $t('reportBug.TechnicalDetails') }}</span>
    </ButtonPlain>
    <pre v-if="details">{{ JSON.stringify(report, null, 2) }}</pre>

    <label :for="_uid">{{ $t('reportBug.DescriptionTitle') }}</label>
    <textarea
      :id="_uid"
      v-model="userComment"
      class="report-text"
      :placeholder="$t('reportBug.Placeholder')"
    />

    <AeButton
      class="cancel"
      @click="resolve(false)"
    >
      {{ $t('reportBug.Cancel') }}
    </AeButton>
    <AeButton @click="send">
      {{ $t('reportBug.Send') }}
    </AeButton>
  </Dialog>
</template>

<script>
import Backend from '../utils/backend';
import Dialog from './Dialog.vue';
import ButtonPlain from './ButtonPlain.vue';
import IconRightArrow from '../assets/iconRightArrow.svg?icon-component';
import AeButton from './AeButton.vue';

export default {
  components: {
    Dialog,
    ButtonPlain,
    IconRightArrow,
    AeButton,
  },
  props: {
    resolve: { type: Function, required: true },
    report: { type: Object, required: true },
  },
  data: () => ({
    userComment: '',
    details: false,
  }),
  methods: {
    async send() {
      await Backend.errorReport({
        ...this.report,
        userComment: this.userComment,
      });
      this.resolve(true);
    },
  },
};
</script>

<style lang="scss" scoped>
.error-report-modal {
  .toggle-details,
  label {
    display: flex;
    align-items: center;
    margin-top: 24px;
    color: $light_font_color;
  }

  .toggle-details .iconRightArrow {
    width: 20px;
    transform: rotate(90deg);

    &.open {
      transform: rotate(-90deg);
    }
  }

  pre,
  textarea {
    background: #171717;
    border-radius: 6px;
    padding: 8px 16px;
  }

  pre {
    text-align: left;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
    max-height: 200px;
  }

  textarea {
    width: 100%;
    border: 1px solid #171717;
    outline: none;
    resize: vertical;
    min-height: 63px;
    color: #fff;
    font-size: 14px;
    line-height: 24px;

    &:focus {
      background: #000;
      border-color: $secondary_color;
    }
  }

  .ae-button {
    margin-top: 40px;

    &.cancel {
      background: #232323;
      color: $tip_note_color;
      margin-right: 24px;
    }
  }
}
</style>
