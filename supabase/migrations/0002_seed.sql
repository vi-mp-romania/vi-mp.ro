-- Initial content: the settings row, the three timeline stages from the mockup and two demo news
-- items. Everything here is editable afterwards from the control panel (#/admin).

insert into public.site_settings (id, discord_url, hero_image_url, current_stage)
values (1, '', '', 2);

insert into public.status_stages (position, title, caption) values
  (1, 'Consolă', 'Lansată'),
  (2, 'PC', 'Disponibil'),
  (3, 'Multiplayer oficial', 'Încă așteptare');

insert into public.news_items (source, kind_label, title, summary, url, cta_label, is_published, position)
values
  ('youtube', 'Video', 'Ce se mai știe despre GTA VI pe PC',
   'Un rezumat al informațiilor și demonstrațiilor apărute.', '', 'Vezi clipul', true, 1),
  ('reddit', 'Discuție', 'Cum ne imaginăm serverele de GTA VI',
   'Idei, întrebări și proiecte din comunitate.', '', 'Deschide discuția', true, 2);
