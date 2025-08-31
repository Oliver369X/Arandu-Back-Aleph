-- 🗃️ Script de inicialización de la base de datos SchoolAI
-- Se ejecuta automáticamente cuando se crea el container de PostgreSQL

-- Configuraciones básicas
SET timezone = 'UTC';

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Configurar esquema por defecto
SET search_path TO public;

-- Crear función para timestamps automáticos
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Configuraciones de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Configurar memoria para mejor rendimiento
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Configurar conexiones
ALTER SYSTEM SET max_connections = '100';

-- Configurar logs
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'pg_log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';

-- Recargar configuración
SELECT pg_reload_conf();

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos SchoolAI inicializada correctamente';
    RAISE NOTICE '📊 Timezone: %', current_setting('timezone');
    RAISE NOTICE '🔗 Max connections: %', current_setting('max_connections');
END $$;
