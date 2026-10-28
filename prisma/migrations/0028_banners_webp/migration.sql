-- Banners de Nova en imagen de alta resolución (WebP): reemplaza los SVG de la tienda donde todavía se usan.
-- Solo cambia filas que apuntan exactamente a la imagen original; lo que se haya subido desde el panel no se toca.
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-bonus.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/hero-bonus.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-nequi.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/hero-nequi.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-pagos.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/hero-pagos.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/hero-codigos.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/hero-codigos.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/pasos-wide.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/pasos-wide.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/garantia-wide.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/garantia-wide.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/sinclaves-wide.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/sinclaves-wide.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/codigos.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/codigos.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/garantia.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/garantia.svg';
UPDATE `PromoBanner` SET `imageUrl` = '/promo/soporte.webp', `updatedAt` = NOW(3) WHERE `imageUrl` = '/promo/soporte.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-bonus.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/hero-bonus.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-nequi.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/hero-nequi.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-pagos.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/hero-pagos.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/hero-codigos.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/hero-codigos.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/pasos.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/pasos.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/garantia.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/garantia.svg';
UPDATE `PromoBanner` SET `imageMobileUrl` = '/promo/m/sinclaves.webp', `updatedAt` = NOW(3) WHERE `imageMobileUrl` = '/promo/m/sinclaves.svg';
