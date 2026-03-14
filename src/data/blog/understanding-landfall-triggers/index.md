---
title: "Understanding Landfall: Timing, Stacking, and Hidden Lines"
description: "Landfall is one of Magic's most deceptively deep mechanics. We break down trigger timing, how to stack multiple landfall abilities, and the non-obvious lines that separate good pilots from great ones."
author: "FullControlMTG"
publishedAt: "2025-03-01"
tags:
  - strategy
  - mechanics
  - landfall
  - commander
coverImage: "https://cards.scryfall.io/art_crop/front/a/0/a0d57b75-6cb0-4f8d-9dcc-3aa01c89a41a.jpg"
featured: true
---

## What Is Landfall?

Landfall is a triggered ability that fires whenever a land enters the battlefield under your control. Simple enough — but the interactions that stem from it are anything but.

The key word is **triggered**. Landfall abilities go on the stack after the land resolves, which means they use the game state *at the time they resolve*, not at the time they triggered. This distinction matters more than most players realize.

## Trigger Timing

When you play a land, the following happens in order:

1. You declare you're playing a land (this uses your land drop for the turn)
2. The land enters the battlefield
3. State-based actions are checked
4. Landfall triggers are placed on the stack
5. Players receive priority

This means that by the time your landfall trigger resolves, you can respond. You can crack a fetch land in response to your own landfall trigger to generate a *second* trigger before the first one resolves.

## Stacking Fetch Lands

Here's the line most newer players miss with Aesi:

1. Play a fetch land → Aesi triggers (trigger A on stack)
2. In response to trigger A, crack the fetch → fetch land ETB → Aesi triggers again (trigger B on stack)
3. Trigger B resolves: draw a card, potentially reveal another land
4. Trigger A resolves: draw another card

Two draws from one fetch land. If you also have Exploration in play, the land you drew can be played immediately, generating a third trigger.

## The Horn of Greed Loop

With **Horn of Greed** and **Crucible of Worlds** in play alongside fetch lands, every fetch represents:

- A landfall trigger (Horn draw)
- A land in the graveyard (Crucible recursion next turn)
- Potential extra draws from Aesi

At a certain critical mass of draw and extra land drops, this loop becomes effectively infinite within a single turn, letting you dig through your entire library.

## Practical Takeaways

- Always ask yourself whether you can generate landfall triggers in response to existing triggers
- Count your land drops carefully — Aesi gives you one extra, but each Exploration, Oracle of Mul Daya, and similar effect stacks
- Fetch lands are never just "fixing" in a landfall deck; they're fuel
- Track your graveyard — Crucible of Worlds turns spent fetches into a renewable resource
