<script lang="ts">
  import { defineMessages } from "@healthcheck/i18n";
  import { Accordion, Select } from "@healthcheck/theme";
  import TablerAirBalloon from '~icons/tabler/air-balloon';

  const messages = defineMessages("home", {
    title: "Welcome to healthcheck.help",
  });

  const items = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];

  let fruit = $state("apple");
</script>

<h1>{$messages.title}</h1>
<TablerAirBalloon />
<Select {items} bind:value={fruit} placeholder="Select a fruit" />
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<Accordion.Root type="single">
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger>Item 1 Title</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content
      >This is the collapsible content for this section.</Accordion.Content
    >
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Header>
      <Accordion.Trigger>Item 2 Title</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content
      >This is the collapsible content for this section.</Accordion.Content
    >
  </Accordion.Item>
</Accordion.Root>
