-- Navidad de cristal encendida (Panel → Ajustes → Temporada). Solo es un ajuste: «Normal» vuelve al diseño de
-- siempre, y el 1 de enero se apaga sola.
INSERT INTO `Setting` (`key`, `value`, `updatedAt`) VALUES ('seasonTheme', 'navidad', CURRENT_TIMESTAMP(3))
  ON DUPLICATE KEY UPDATE `value` = 'navidad', `updatedAt` = CURRENT_TIMESTAMP(3);
