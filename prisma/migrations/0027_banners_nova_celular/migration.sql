-- Banners propios de Nova: versión de celular para los banners del inicio que trae la tienda.
-- Solo se completa si el banner sigue con su imagen original y aún no tiene versión de celular.
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-bonus.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_bonus' AND `imageUrl` = '/promo/hero-bonus.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-nequi.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_nequi' AND `imageUrl` = '/promo/hero-nequi.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-pagos.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_pagos' AND `imageUrl` = '/promo/hero-pagos.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-codigos.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_hero_codigos' AND `imageUrl` = '/promo/hero-codigos.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/pasos.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_pasos_wide' AND `imageUrl` = '/promo/pasos-wide.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/garantia.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_garantia_wide' AND `imageUrl` = '/promo/garantia-wide.svg' AND `imageMobileUrl` IS NULL;
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/sinclaves.svg', `updatedAt` = NOW(3) WHERE `id` = 'bnr_sinclaves_wide' AND `imageUrl` = '/promo/sinclaves-wide.svg' AND `imageMobileUrl` IS NULL;
