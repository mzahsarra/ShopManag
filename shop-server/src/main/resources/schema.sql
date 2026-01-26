-- E_PRD_15 : Migration des prix vers centimes (si la colonne est encore en float/real)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'price' AND data_type = 'real'
    ) THEN
        -- On multiplie par 100 AVANT de changer le type pour garder les centimes
ALTER TABLE products ALTER COLUMN price TYPE bigint USING (price * 100)::bigint;
END IF;
END $$;;

-- E_AME_20 : Creation des index manquants sur les Foreign Keys
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);;
CREATE INDEX IF NOT EXISTS idx_products_categories_product_id ON products_categories(product_id);;
CREATE INDEX IF NOT EXISTS idx_products_categories_category_id ON products_categories(category_id);;
CREATE INDEX IF NOT EXISTS idx_shops_opening_hours_shop_id ON shops_opening_hours(shop_id);;
CREATE INDEX IF NOT EXISTS idx_shops_opening_hours_opening_id ON shops_opening_hours(opening_hours_id);;