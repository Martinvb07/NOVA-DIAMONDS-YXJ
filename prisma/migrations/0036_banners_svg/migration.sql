-- Banners de Nova en vector (SVG, como en VANTA): más livianos y nítidos que las imágenes 4K. Mismos banners (mismos id).
UPDATE `PromoBanner` SET `imageUrl` = REPLACE(`imageUrl`, '.webp', '.svg'), `updatedAt` = NOW(3) WHERE `imageUrl` LIKE '/promo/nova/%.webp';
UPDATE `PromoBanner` SET `imageMobileUrl` = REPLACE(`imageMobileUrl`, '.webp', '.svg'), `updatedAt` = NOW(3) WHERE `imageMobileUrl` LIKE '/promo/nova/%.webp';
