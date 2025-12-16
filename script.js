document.addEventListener('DOMContentLoaded', () => {
    const asignaturas = document.querySelectorAll('.asignatura');
    const promedioDisplay = document.getElementById('valor-promedio');

    // Cargar estado de completado y notas guardadas desde la memoria del navegador
    let savedGrades = JSON.parse(localStorage.getItem('gradesBiologiaMarina')) || {};
    let completedCourses = new Set(JSON.parse(localStorage.getItem('completedCoursesBiologiaMarinaUdec')) || []);

    // Función para calcular el promedio ponderado
    const calculateAverage = () => {
        let totalCreditos = 0;
        let sumaPonderada = 0;

        asignaturas.forEach(asignatura => {
            const id = asignatura.id;
            
            // Solo incluimos en el promedio si el curso está marcado como completado
            if (completedCourses.has(id)) {
                const input = asignatura.querySelector('.nota-input');
                let nota = parseFloat(input.value);
                // Si el campo de nota tiene comas en vez de puntos, lo intentamos arreglar
                if (isNaN(nota) && input.value.includes(',')) {
                    nota = parseFloat(input.value.replace(',', '.'));
                }

                const creditos = parseInt(asignatura.dataset.creditos) || 0; 

                // Solo sumar si hay una nota válida (entre 1.0 y 7.0) y créditos válidos
                if (!isNaN(nota) && nota >= 1.0 && nota <= 7.0 && creditos > 0) {
                    sumaPonderada += nota * creditos;
                    totalCreditos += creditos;
                }
            }
        });

        if (totalCreditos > 0) {
            const promedio = sumaPonderada / totalCreditos;
            promedioDisplay.textContent = promedio.toFixed(2); // Muestra 2 decimales
        } else {
            promedioDisplay.textContent = "0.0";
        }
    };

    // Función para guardar todo en el navegador
    const saveState = () => {
        localStorage.setItem('completedCoursesBiologiaMarinaUdec', JSON.stringify(Array.from(completedCourses)));
        localStorage.setItem('gradesBiologiaMarina', JSON.stringify(savedGrades));
        calculateAverage(); // Recalcular promedio cada vez que guardamos
    };

    // Función principal que actualiza colores y bloqueos
    const updateAsignaturasState = () => {
        asignaturas.forEach(asignatura => {
            const id = asignatura.id;
            const input = asignatura.querySelector('.nota-input');
            const prerequisites = asignatura.dataset.prerequisites ? asignatura.dataset.prerequisites.split(',').filter(p => p.trim() !== '') : [];

            // Restaurar nota si existe en memoria
            if (savedGrades[id]) {
                input.value = savedGrades[id];
            }

            // Estado de completado
            if (completedCourses.has(id)) {
                asignatura.classList.add('completed');
                asignatura.classList.remove('locked');
            } else {
                asignatura.classList.remove('completed');
                
                // Verificar si se cumplen los prerrequisitos
                const allPrerequisitesMet = prerequisites.every(prereqId => completedCourses.has(prereqId));
                
                if (prerequisites.length === 0 || allPrerequisitesMet) {
                    asignatura.classList.remove('locked');
                } else {
                    asignatura.classList.add('locked');
                }
            }
        });
        calculateAverage(); // Calcular promedio al cargar la página
    };

    // Inicializar al abrir la página
    updateAsignaturasState();

    // Añadir eventos a cada asignatura
    asignaturas.forEach(asignatura => {
        const input = asignatura.querySelector('.nota-input');
        const id = asignatura.id;

        // IMPORTANTE: Evitar que hacer clic en la cajita de la nota marque/desmarque el ramo
        input.addEventListener('click', (e) => {
            e.stopPropagation(); 
        });

        // Guardar la nota cuando el usuario escribe
        input.addEventListener('input', () => {
            savedGrades[id] = input.value;
            saveState();
        });

        // Click en el recuadro general del ramo (para marcar/desmarcar)
        asignatura.addEventListener('click', () => {
            if (!asignatura.classList.contains('locked')) {
                if (completedCourses.has(id)) {
                    // Si ya estaba completado, lo desmarcamos
                    completedCourses.delete(id);
                } else {
                    // Si no estaba completado, lo marcamos
                    completedCourses.add(id);
                }
                saveState();
                updateAsignaturasState();
            }
        });
    });
});
