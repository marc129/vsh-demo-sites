# Jarvis — VSH Media Studio 3D office

Marc is replacing the Lovable Mission Control page with this 3D office. Keep posting on the same Supabase channel. Do not change the Lovable site.

## Site

Pages URL (open this once Nova has copied the build):

https://marc129.github.io/vsh-demo-sites/vsh-hq-3d/

Until that path is updated, the office you should treat as the target is that URL. The channel commands below do not change.

## Same Supabase

```
U=https://tcuipiwsljchkuptowxq.supabase.co/rest/v1
K=sb_publishable_l0YSPojXqXC6gGJOz-jwnw_LldYnnHK
```

`apikey` header only.

### Talk to Nova

```bash
curl -s -X POST "$U/agent_channel" \
  -H "apikey: $K" -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"sender":"jarvis","recipient":"nova","body":"Jarvis here, I see the 3D office."}'
```

### Read what is unmarked for you

```bash
curl -s "$U/agent_channel?jarvis_read_at=is.null&recipient=in.(jarvis,all)&order=created_at.asc&select=id,created_at,sender,recipient,body" \
  -H "apikey: $K"
```

### Mark read

```bash
curl -s -X PATCH "$U/agent_channel?id=eq.<id>" \
  -H "apikey: $K" -H "Content-Type: application/json" \
  -d "{\"jarvis_read_at\":\"$(date -u +%FT%TZ)\"}"
```

The wall board and the Nova ↔ Jarvis drawer read this table. A subscribe check on 26 Oct 2026 joined `agent_channel` and `ops_feed` (status `SUBSCRIBED`), so posts should show up without a refresh. If the drawer later says Polling, add the tables to the realtime publication:

```sql
alter publication supabase_realtime add table public.agent_channel;
alter publication supabase_realtime add table public.ops_feed;
```

## What the board reads from you

Keep writing `ops_feed` the way you already do.

- `kind = lane_stats` — optional outreach note. The floor does not name old sending lanes. Maya is the one outreach worker under you. Harbor’s desk stays Cross Street.
- Money is a daily snapshot and a weekly snapshot, not every invoice. No customer names.

```bash
curl -s -X POST "$U/ops_feed" \
  -H "apikey: $K" -H "Content-Type: application/json" \
  -d '{
    "source":"jarvis",
    "kind":"payments_snapshot",
    "title":"QB + Square + Stripe daily",
    "body":"MTD only. No customer names.",
    "payload":{
      "as_of":"2026-10-26",
      "cadence":"daily",
      "qb":{"mtd_revenue":0,"net_to_vsh":0,"ad_spend_passthrough":0,"unpaid_total":0,"open_invoices":0,"currency":"USD"},
      "square":{"connected":false,"last_sync":null,"mtd_volume":null,"currency":"USD"},
      "stripe":{"connected":false,"last_sync":null,"mtd_volume":null,"currency":"USD"}
    }
  }'
```

Use real numbers when you have them. Post `"cadence":"weekly"` once a week as well.

Two different money numbers:

- `mtd_revenue` is the QuickBooks month-to-date top line. It can include client money VSH is only holding.
- `net_to_vsh` is what actually stays with VSH. It must exclude client ad-spend pass-throughs. Cross Street ad budget given to VSH to spend on ads is not profit. Do not add it to `net_to_vsh`.
- `ad_spend_passthrough` is that excluded amount, so the board can show it was left out. It is not a third kind of profit.

Square and Stripe: you hold the keys, not this site. Summarize webhook volume (Square payments, Stripe payment intents or charges) into `mtd_volume`, `connected`, and `last_sync`.

Studio bookings, if Marc grants you Studio admin: `kind = studio_metrics` with `bookings` and `revenue`. No customer names.
