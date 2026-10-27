-- Nombre de la tienda: NOVA DIAMONDS YXJ (correos, títulos y avisos). Solo cambia bases que traían el nombre anterior.
UPDATE `Setting` SET `value` = 'NOVA DIAMONDS YXJ', `updatedAt` = NOW(3) WHERE `key` = 'storeName' AND `value` IN ('VANTA', 'Vanta', 'VANTAGG');
