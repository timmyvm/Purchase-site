-- Singles vs full sets, so the Sets collection and the product page don't
-- have to guess from the id or the size label.
alter table public.sticker_products
  add column kind text not null default 'single' check (kind in ('single', 'set'));
update public.sticker_products set kind = 'set' where id = 'drop-01-set';
