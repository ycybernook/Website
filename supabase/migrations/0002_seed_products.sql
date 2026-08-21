-- Placeholder seed for the 11 existing catalog items. base_price is 0 and
-- there are no option_groups yet — fill in real prices/options via the
-- Supabase table editor (or write follow-up SQL) after launch.

insert into cybernook.products (name, description, image_url, base_price, sort_order) values
  ('3D Printed Keychain', 'Personalized · 1-9 Letters · 1, 2 or 3 colors', '/products/00-3d-printed-keychain.jpg', 0, 0),
  ('3D Clicker Keychain', 'Personalized · Modular base · 2 colors', '/products/01-3d-clicker-keychain.jpg', 0, 1),
  ('Leather Keychain', 'Personalized · Max 6 letters · Free keychain charm', '/products/02-leather-keychain.jpg', 0, 2),
  ('3D Printed Chunky Letters', 'Personalized · Sold per set · A-Z, 0-9 · 2 colors', '/products/03-3d-printed-chunky-letters.jpg', 0, 3),
  ('Engraved Pen', 'Wooden pen · Personalized · 1, 3, 5 & 10 pcs', '/products/04-engraved-pen.jpg', 0, 4),
  ('PVC Bag Tag', 'PVC 5.4x8.5cm · Personalized · With bag loop', '/products/05-pvc-bag-tag.jpg', 0, 5),
  ('Personalized Stickers', 'Normal/Waterproof · Any size fits A4', '/products/06-personalized-stickers.jpg', 0, 6),
  ('Sintra Board', '3mm thick · A4 size · Personalized · With phototop', '/products/07-sintra-board.jpg', 0, 7),
  ('Personalized Photo Cards', '5.4x8.5cm · 1 sided or back2back', '/products/08-personalized-photo-cards.jpg', 0, 8),
  ('Personalized Mugs', 'Regular Quaff Mug · Personalized', '/products/09-personalized-mugs.jpg', 0, 9),
  ('Ref Magnets & Bag Pins', '50x50mm · Personalized magnets or pins', '/products/10-ref-magnets-bag-pins.jpg', 0, 10);
