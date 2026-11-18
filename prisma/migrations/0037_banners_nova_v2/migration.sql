-- Banners de Nova rediseñados (con diseño propio para celular) en una carpeta nueva (/promo/nova2): así ni el
-- navegador ni el optimizador de imágenes muestran las versiones anteriores guardadas en caché. Mismos banners (mismos id).
UPDATE `PromoBanner` SET `imageUrl` = REPLACE(REPLACE(`imageUrl`, '/promo/nova/', '/promo/nova2/'), '.svg', '.webp'), `updatedAt` = NOW(3) WHERE `imageUrl` LIKE '/promo/nova/%';
UPDATE `PromoBanner` SET `imageMobileUrl` = REPLACE(REPLACE(`imageMobileUrl`, '/promo/nova/', '/promo/nova2/'), '.svg', '.webp'), `updatedAt` = NOW(3) WHERE `imageMobileUrl` LIKE '/promo/nova/%';
