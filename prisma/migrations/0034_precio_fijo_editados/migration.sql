-- Los paquetes cuyo precio el dueño ya editó en el panel quedan como «precio fijo»: la ganancia mínima
-- automática no los cambia (se puede desmarcar en Diamantes y precios).
UPDATE `DiamondPackage` p
SET p.`manualPrice` = true
WHERE p.`manualPrice` = false
  AND EXISTS (SELECT 1 FROM `AuditLog` a WHERE a.`action` = 'package.update' AND a.`entity` = 'DiamondPackage' AND a.`entityId` = p.`id` AND a.`actorId` IS NOT NULL);
