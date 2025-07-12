document.addEventListener('DOMContentLoaded', () => {
    const asignaturas = document.querySelectorAll('.asignatura');
    // Cargar el estado guardado en localStorage, si existe
    const completedCourses = new Set(JSON.parse(localStorage.getItem('completedCoursesBiologiaMarinaUdec')) || []);

    // Función para guardar el estado actual de los cursos completados
    const saveState = () => {
        localStorage.setItem('completedCoursesBiologiaMarinaUdec', JSON.stringify(Array.from(completedCourses)));
    };

    // Función para verificar y actualizar el estado de bloqueo/desbloqueo de todas las asignaturas
    const updateAsignaturasState = () => {
        asignaturas.forEach(asignatura => {
            const id = asignatura.id;
            // Obtener los prerrequisitos del atributo data-prerequisites y filtrar vacíos
            const prerequisites = asignatura.dataset.prerequisites.split(',').filter(p => p.trim() !== '');

            // Si la asignatura ya está marcada como completada, aplicar su estilo y saltar comprobación de prerrequisitos
            if (completedCourses.has(id)) {
                asignatura.classList.add('completed');
                asignatura.classList.remove('locked'); // Asegurarse de que no tenga la clase locked
                return; // Ir a la siguiente asignatura
            }

            // Comprobar si TODOS los prerrequisitos para esta asignatura están en el conjunto de cursos completados
            const allPrerequisitesMet = prerequisites.every(prereqId => completedCourses.has(prereqId));

            // Si no tiene prerrequisitos O si todos sus prerrequisitos están cumplidos
            if (prerequisites.length === 0 || allPrerequisitesMet) {
                asignatura.classList.remove('locked'); // Desbloquear la asignatura
            } else {
                asignatura.classList.add('locked'); // Bloquear la asignatura
            }
        });
    };

    // Inicializar el estado de la malla al cargar la página
    updateAsignaturasState();

    // Añadir un "escuchador de eventos" de clic a cada asignatura
    asignaturas.forEach(asignatura => {
        asignatura.addEventListener('click', () => {
            const id = asignatura.id;

            // Solo permitir el cambio de estado si la asignatura NO está bloqueada
            if (!asignatura.classList.contains('locked')) {
                if (completedCourses.has(id)) {
                    // Si ya estaba completada, la desmarcamos
                    completedCourses.delete(id);
                    asignatura.classList.remove('completed');
                } else {
                    // Si no estaba completada, la marcamos
                    completedCourses.add(id);
                    asignatura.classList.add('completed');
                }
                saveState(); // Guardar el estado actualizado
                updateAsignaturasState(); // Re-evaluar el estado de todas las asignaturas
            }
        });
    });
});
