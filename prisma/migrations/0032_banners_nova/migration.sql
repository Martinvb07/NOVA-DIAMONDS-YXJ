-- Banners de Nova con la composición de VANTA: paleta azul/violeta, destello nova, isotipo YXJ y títulos en Orbitron.
-- Mismos banners (mismos id), solo cambian las imágenes; las de /promo/yxj se eliminaron del repositorio.
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/hero-bonus.webp', `imageMobileUrl` = '/promo/nova/m/hero-bonus.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_bonus';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/hero-nequi.webp', `imageMobileUrl` = '/promo/nova/m/hero-nequi.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_nequi';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/hero-pagos.webp', `imageMobileUrl` = '/promo/nova/m/hero-pagos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_pagos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/hero-codigos.webp', `imageMobileUrl` = '/promo/nova/m/hero-codigos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/pasos-wide.webp', `imageMobileUrl` = '/promo/nova/m/pasos.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_pasos_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/garantia-wide.webp', `imageMobileUrl` = '/promo/nova/m/garantia.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_garantia_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/sinclaves-wide.webp', `imageMobileUrl` = '/promo/nova/m/sinclaves.webp', `updatedAt` = NOW(3) WHERE `id` = 'bnr_sinclaves_wide';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/codigos.webp', `imageMobileUrl` = NULL, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_codigos';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/garantia.webp', `imageMobileUrl` = NULL, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_garantia';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/nova/soporte.webp', `imageMobileUrl` = NULL, `updatedAt` = NOW(3) WHERE `id` = 'bnr_side_soporte';
-- Cualquier otro banner que apunte a una imagen eliminada queda desactivado (no se borra).
UPDATE `PromoBanner` SET `active` = false, `updatedAt` = NOW(3) WHERE `imageUrl` LIKE '/promo/yxj/%' OR `imageMobileUrl` LIKE '/promo/yxj/%';
