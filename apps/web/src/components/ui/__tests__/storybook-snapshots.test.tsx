import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/test';

import * as buttonStories from '../button.stories';
import * as cardStories from '../card.stories';

describe('storybook snapshots', () => {
  it('Button stories', () => {
    const stories = composeStories(buttonStories);
    for (const story of Object.values(stories)) {
      const { container } = render(story());
      expect(container).toMatchSnapshot();
    }
  });

  it('Card stories', () => {
    const stories = composeStories(cardStories);
    for (const story of Object.values(stories)) {
      const { container } = render(story());
      expect(container).toMatchSnapshot();
    }
  });
});
