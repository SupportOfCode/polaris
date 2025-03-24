import { Page, Card, Button, Grid, InlineGrid } from "@shopify/polaris";

export default function Task() {
  return (
    <Page>
      <InlineGrid columns={{ lg: 1 }}>
        <Button>Button</Button>
        <Button variant="plain">Button has variant plain</Button>
        <Button variant="tertiary">Button has variant tertiary</Button>
      </InlineGrid>
    </Page>
  );
}
