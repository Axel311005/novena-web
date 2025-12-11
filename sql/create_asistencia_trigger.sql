-- Trigger para crear automáticamente un registro de asistencia cuando se crea un niño
-- Este trigger se ejecuta después de insertar un nuevo registro en la tabla 'kid'

-- Función que se ejecutará cuando se inserte un nuevo niño
CREATE OR REPLACE FUNCTION create_asistencia_on_kid_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar un nuevo registro de asistencia para el niño recién creado
    -- day1 se marca como true, los demás días (day2-day9) usan sus valores por defecto (false)
    INSERT INTO asistencia (kid_id, created_by_user_id, day1)
    VALUES (NEW.id, NEW.created_by_user_id, true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta después de INSERT en la tabla kid
DROP TRIGGER IF EXISTS trigger_create_asistencia_on_kid_insert ON kid;

CREATE TRIGGER trigger_create_asistencia_on_kid_insert
    AFTER INSERT ON kid
    FOR EACH ROW
    EXECUTE FUNCTION create_asistencia_on_kid_insert();

-- Comentario explicativo
COMMENT ON TRIGGER trigger_create_asistencia_on_kid_insert ON kid IS 
'Crea automáticamente un registro de asistencia cuando se inserta un nuevo niño. day1 se marca como true, los demás días (day2-day9) se inicializan con false.';

