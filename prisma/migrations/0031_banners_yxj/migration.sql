-- Banners con la identidad YXJ: diamante oficial de Nova, grafiti YXJ de fondo y títulos cromados.
-- Mismos banners (mismos id), solo cambian las imágenes; las anteriores se eliminaron del repositorio.
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/hero-bonus.webp', `imageMobileUrl` = '/promo/yxj/m/hero-bonus.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_bonus';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/hero-nequi.webp', `imageMobileUrl` = '/promo/yxj/m/hero-nequi.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_nequi';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/hero-pagos.webp', `imageMobileUrl` = '/promo/yxj/m/hero-pagos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_pagos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/hero-codigos.webp', `imageMobileUrl` = '/promo/yxj/m/hero-codigos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/pasos-wide.webp', `imageMobileUrl` = '/promo/yxj/m/pasos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_pasos_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/garantia-wide.webp', `imageMobileUrl` = '/promo/yxj/m/garantia.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_garantia_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/sinclaves-wide.webp', `imageMobileUrl` = '/promo/yxj/m/sinclaves.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_sinclaves_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/codigos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/garantia.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_garantia';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/yxj/soporte.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_soporte';
-- Cualquier otro banner que apunte a una imagen eliminada queda desactivado (no se borra).
UPDATE `PromoBanner` SET `active` = false, `updatedAt` = NOW(3)
WHERE (`imageUrl` LIKE '/promo/%.webp' AND `imageUrl` NOT LIKE '/promo/yxj/%')
   OR (`imageMobileUrl` LIKE '/promo/%.webp' AND `imageMobileUrl` NOT LIKE '/promo/yxj/%');
