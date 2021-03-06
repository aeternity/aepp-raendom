import { shallowMount } from '@vue/test-utils';
import Loading from '../Loading.vue';

describe('Loading', () => {
  it('is visible', () => {
    const wrapper = shallowMount(Loading, {
      mocks: {
        $t: () => 'locale-specific-text',
      },
    });
    expect(wrapper.find('.loading').exists()).toBeTruthy();
  });
});
