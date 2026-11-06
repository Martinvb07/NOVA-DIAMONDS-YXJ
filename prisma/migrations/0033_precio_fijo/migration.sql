-- Precio fijo: un paquete con precio puesto a mano no lo cambia la ganancia mínima automática.
ALTER TABLE `DiamondPackage` ADD COLUMN `manualPrice` BOOLEAN NOT NULL DEFAULT false;

-- Ganancia mínima de la tienda: 30 % (general y paquetes de 100 diamantes).
UPDATE `Setting` SET `value` = '30', `updatedAt` = NOW(3) WHERE `key` IN ('minMarginPct', 'minMarginSmallPct');
