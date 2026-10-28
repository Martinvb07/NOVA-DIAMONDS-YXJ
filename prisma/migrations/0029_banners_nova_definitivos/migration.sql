-- Banners definitivos de Nova (WebP). Los banners de la tienda quedan con las imágenes nuevas aunque
-- se hubieran cambiado antes, y se retiran los banners viejos que ya no se usan.

-- 1. Banners de la tienda: imagen nueva y activos.
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-bonus.webp', `imageMobileUrl` = '/promo/m/hero-bonus.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_bonus';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-nequi.webp', `imageMobileUrl` = '/promo/m/hero-nequi.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_nequi';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-pagos.webp', `imageMobileUrl` = '/promo/m/hero-pagos.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_pagos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-codigos.webp', `imageMobileUrl` = '/promo/m/hero-codigos.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/pasos-wide.webp', `imageMobileUrl` = '/promo/m/pasos.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_pasos_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/garantia-wide.webp', `imageMobileUrl` = '/promo/m/garantia.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_garantia_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/sinclaves-wide.webp', `imageMobileUrl` = '/promo/m/sinclaves.webp', `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_sinclaves_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/codigos.webp', `imageMobileUrl` = NULL, `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/garantia.webp', `imageMobileUrl` = NULL, `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_garantia';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/soporte.webp', `imageMobileUrl` = NULL, `active` = true, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_soporte';

-- 2. Banners viejos de la tienda que ya no se usan (las imágenes SVG se eliminan).
DELETE FROM `PromoBanner` WHERE `id` IN ('bnr_bonus', 'bnr_nequi', 'bnr_pagos', 'bnr_pasos', 'bnr_codigos', 'bnr_cuentas', 'bnr_filtros', 'bnr_rastreo', 'bnr_soporte', 'bnr_garantia', 'bnr_sinclaves', 'bnr_wide_cuentas');

-- 3. Otros banners en los espacios del inicio y laterales: se desactivan (no se borran; se pueden reactivar en el panel).
UPDATE `PromoBanner` SET `active` = false, `updatedAt` = NOW(3)
WHERE `active` = true
  AND `placement` IN ('TOP', 'HOME_TRUST', 'HOME_BOTTOM', 'TOPUP_SIDE', 'ACCOUNT_SIDE', 'TRACK_SIDE')
  AND `id` NOT IN ('bnr_hero_bonus', 'bnr_hero_nequi', 'bnr_hero_pagos', 'bnr_hero_codigos', 'bnr_pasos_wide', 'bnr_garantia_wide', 'bnr_sinclaves_wide', 'bnr_side_codigos', 'bnr_side_garantia', 'bnr_side_soporte');

-- 4. Cualquier banner que aún apunte a un SVG eliminado queda desactivado.
UPDATE `PromoBanner` SET `active` = false, `updatedAt` = NOW(3) WHERE `imageUrl` LIKE '/promo/%.svg' OR `imageMobileUrl` LIKE '/promo/%.svg';
