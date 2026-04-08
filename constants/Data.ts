export const SOS_DATA = [
  {
    id: 'ansiedad',
    title: 'ANSIEDAD O PÁNICO',
    icon: 'thunderstorm',
    color: '#FCA5A5',
    steps: [
      { type: 'info', text: 'RESPIRA, ESTÁS SEGURO, ESTO VA A PASAR…' },
      { type: 'input', text: '4 COSAS QUE VEO\n(Escribe las 4 aquí)' },
      { type: 'input', text: '3 COSAS QUE ESCUCHAS\n(Escribe las 3 aquí)' },
      { type: 'input', text: '2 COSAS QUE PUEDES OLER\n(Escribe las 2 aquí)' },
      { type: 'input', text: '1 COSA QUE PUEDES SABOREAR' },
      { type: 'breathing', text: 'AHORA RESPIRA CONSCIENTEMENTE', inhale: 4, hold: 3, exhale: 6, hold2: 2, repeat: 3 },
      { type: 'input', text: '¿CÓMO TE SIENTES AHORA, COMPARADO CON HACE 5 MINUTOS?' },
      { type: 'info', text: 'Esto pasara, siempre pasa. Eres mas fuerte que ayer. Date un abrazo y agradecete por cuidar de ti con tanto amor' },
    ]
  },
  {
    id: 'furia',
    title: 'FURIA',
    icon: 'flame',
    color: '#FDBA74',
    steps: [
      { type: 'info', text: 'NO JUZGUES, NO EDITES, SOLO SUELTA:' },
      {
        type: 'input',
        text: 'Escribí todo lo que necesites sacar. Sin filtro, sin juicio, sin medida. Permitite decir lo que no dirías en voz alta. No hay palabras incorrectas. Este espacio es solo para vos.',
        note: 'Esto no se guarda; en 3 segundos se libera con vos.',
        burnAfterIdleMs: 3000,
        burn: true,
      },
      { type: 'input', text: 'ESTOY ENOJADO POR:' },
      { type: 'input', text: 'QUÉ OTRA EMOCIÓN HAY DEBAJO DE ESTE ENOJO?' },
      { type: 'input', text: 'QUÉ PODRÍA EXPRESAR DE FORMA CONSTRUCTIVA:' },
      { type: 'info', text: 'RESPIRA PROFUNDO, ACABAS DE SOLTAR UN GRAN PESO' },
      { type: 'input', text: '¿DÓNDE SIENTES ESA EMOCIÓN AHORA? (cabeza, pecho, estómago, etc)' },
      { type: 'info', text: 'Pon tu mano ahí. Respira enviando el aire a ese lugar imaginándolo de color violeta, el color que trasmuta.' },
      { type: 'breathing', text: 'ACCIÓN RÁPIDA 1: RESPIRA CONSCIENTEMENTE', inhale: 4, hold: 3, exhale: 6, hold2: 2, repeat: 3 },
      { type: 'counter', text: 'ACCIÓN RÁPIDA 2: CONTAR HASTA 33 DESPACIO', target: 33 },
      { type: 'info', text: 'Date un abrazo y agradecerte por cuidar de ti con tanto amor.' },
    ]
  },
  {
    id: 'pensamiento',
    title: 'PENSAMIENTO CATASTRÓFICO',
    icon: 'eye',
    color: '#C4B5FD',
    steps: [
      { type: 'info', text: 'Tu cerebro está en modo supervivencia. Vamos a traerlo de vuelta a la realidad.' },
      { type: 'input', text: 'EL PENSAMIENTO QUE ME ATERRORIZA ES:' },
      { type: 'input', text: '¿Qué EVIDENCIA real tengo de que esto ocurrirá?' },
      { type: 'input', text: '¿Qué evidencia tengo de que tal vez NO ocurrirá?' },
      { type: 'input', text: 'Si mi mejor amigo tuviera este pensamiento, ¿qué le diría?' },
      { type: 'input', text: '¿Cuál es el escenario MÁS REALISTA (no el peor ni el mejor)?' },
      { type: 'input', text: 'Si lo peor ocurriera, ¿qué recursos tengo para enfrentarlo?' },
      { type: 'input', text: '¿He sobrevivido cosas difíciles antes? (si/no)' },
      { type: 'input', text: '¿Sobreviviré esto también? (si)' },
      { type: 'breathing', text: 'AHORA RESPIRA CONSCIENTEMENTE', inhale: 4, hold: 3, exhale: 6, hold2: 2, repeat: 3 },
      { type: 'input', text: '¿Cuál es el pensamiento más útil que puedo elegir ahora?' },
      { type: 'info', text: 'Abrázate y recuerda que todo sucede ahora.' },
    ]
  },
  {
    id: 'tristeza',
    title: 'TRISTEZA PROFUNDA',
    icon: 'water',
    color: '#93C5FD',
    steps: [
      { type: 'info', text: 'Te veo. Tu dolor es real. Mereces consuelo. Mereces esperanza.' },
      { type: 'input', text: 'AHORA MISMO SIENTO QUE:' },
      { type: 'input', text: 'ME SIENTO ASÍ PORQUE:' },
      { type: 'input', text: 'LO QUE MÁS NECESITO EN ESTE MOMENTO ES:' },
      { type: 'input', text: '¿Hay alguien con quien pueda hablar ahora? (nombre o "no")' },
      { type: 'input', text: 'Tres cosas que siguen siendo ciertas incluso en este dolor\n(Escribe las 3 aquí)' },
      { type: 'input', text: 'UNA razón por pequeña que sea, por la que vale la pena seguir:' },
      { type: 'input', text: 'Lo que le diría a mi yo niño que está sufriendo:' },
      { type: 'info', text: 'Algo que puedo hacer en los próximos 5 minutos para cuidarme:\n□ Beber agua\n□ Música alegre\n□ Abrazarme\n□ Llamar a alguien\n□ Dar un paseo\n□ Respirar' },
      { type: 'breathing', text: 'AHORA RESPIRA CONSCIENTEMENTE', inhale: 4, hold: 3, exhale: 6, hold2: 2, repeat: 3 },
      { type: 'info', text: 'Si sientes que podrías lastimarte, acércate a emergencias. Ellos van a saber ayudarte. TU VIDA IMPORTA' },
      { type: 'info', text: 'Abrázate, siente y agradece cada latido de tu hermoso corazón.' },
    ]
  }
];

export const SOS_FINAL_MESSAGE = "Si estás leyendo esto, significa que tuviste el coraje de pedir ayuda a ti mismo. Eso ya es un acto de fuerza.\n\nEstas crisis no definen quién eres. Son olas que pasan. Has atravesado el 100% de tus peores días hasta ahora. También atravesarás este. Y volverás a florecer.\n\nEste espacio estará aquí siempre que lo necesites. Eres amado. Eres suficiente. Eres fuerte. Incluso cuando no lo sientes. Especialmente cuando no lo sientes.";

export const REVIEW_MODE = true;
export const ORACLE_REVIEW_MODE = false;

export const RITUAL_DATA = [
  {
    day: 1,
    morning: [
      { type: 'input', text: 'Hoy, elijo enfocarme en' },
      { type: 'input', text: 'Una cosa que PUEDO controlar hoy es' },
      { type: 'input', text: 'Mi intención para este día es' },
      { type: 'input', text: 'Me siento (escribe la primera palabra que venga a tu mente)' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Lo mejor de mi día fue' },
      { type: 'input', text: 'Una preocupación que dejo ir ahora es\n(Imagina que la escribes en un papel y la quemas. Ya no es tuya.)' },
      { type: 'input', text: 'Estoy agradecido por:\n1.\n2.\n3.' },
      { type: 'input', text: 'Mañana será un gran día porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 2,
    morning: [
      { type: 'input', text: '¿Qué necesita mi cuerpo hoy? (descanso, movimiento, nutrición, etc.)' },
      { type: 'input', text: 'Una persona a quien quiero mostrar amor hoy es' },
      { type: 'input', text: '¿Cómo lo haré?' },
      { type: 'input', text: 'Hoy me siento orgulloso de mí porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿En qué momento de hoy me sentí más YO MISMO?' },
      { type: 'input', text: 'Una lección que aprendí hoy fue' },
      { type: 'input', text: 'Algo que hice hoy por MI BIENESTAR fue' },
      { type: 'input', text: 'Tres cosas hermosas que noté hoy:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 3,
    morning: [
      { type: 'input', text: '¿Qué emoción estoy sintiendo ahora mismo?' },
      { type: 'input', text: '¿Dónde la siento en mi cuerpo?' },
      { type: 'input', text: '¿Qué necesita esa emoción de mí? (ser escuchada, procesada, expresada)' },
      { type: 'input', text: 'Hoy voy a ser amable conmigo cuando' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿Cuándo hoy me juzgué duramente?' },
      { type: 'input', text: 'Si mi mejor amigo hubiera hecho lo mismo, ¿qué le diría?\n(Ahora dite eso a ti mismo. Mereces esa compasión.)' },
      { type: 'input', text: 'Un logro pequeño de hoy que celebro es' },
      { type: 'input', text: 'Me perdono por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 4,
    morning: [
      { type: 'input', text: '¿Qué me está robando paz mental últimamente?' },
      { type: 'input', text: '¿Es algo que PUEDO cambiar? □ Sí □ No\nSi SÍ: ¿Qué acción tomaré? Si NO: ¿Cómo puedo aceptar y soltar?' },
      { type: 'input', text: 'Una afirmación poderosa para hoy: "YO SOY..." ' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy me sentí conectado conmigo cuando' },
      { type: 'input', text: 'Un "no" que necesito decir (a otros o a mí mismo) es' },
      { type: 'input', text: 'Me doy permiso para' },
      { type: 'input', text: 'Gracias a:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 5,
    morning: [
      { type: 'input', text: '¿Qué está pidiendo mi corazón hoy?' },
      { type: 'input', text: '¿Qué pequeño paso puedo dar hacia eso?' },
      { type: 'input', text: 'Hoy elijo creer que' },
      { type: 'input', text: 'Una cosa que me hace sonreír es' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿Qué hubiera hecho diferente hoy? (sin juicio, solo aprendizaje)' },
      { type: 'input', text: '¿Qué me enseña esto sobre mí?' },
      { type: 'input', text: 'Mañana intentaré' },
      { type: 'input', text: 'Hoy viví, no solo sobreviví, cuando' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 6,
    morning: [
      { type: 'input', text: '¿De qué me siento capaz hoy?' },
      { type: 'input', text: 'Una creencia limitante que estoy dejando ir es' },
      { type: 'input', text: 'La reemplazo con esta verdad: "YO PUEDO..." ' },
      { type: 'input', text: 'Hoy me regalo' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Un momento donde fui valiente hoy (aunque pequeño) fue' },
      { type: 'input', text: '¿Cómo cuidé mi salud mental hoy?' },
      { type: 'input', text: 'Una conversación que necesito tener (conmigo o con alguien) es sobre' },
      { type: 'input', text: 'Agradezco a mi cuerpo por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 7,
    morning: [
      { type: 'info', text: '🌅 MAÑANA - REFLEXIÓN SEMANAL' },
      { type: 'input', text: 'Mirando esta primera semana, ¿qué patrón noto en mis emociones?' },
      { type: 'input', text: '¿Qué aprendí sobre mí en estos 7 días?' },
      { type: 'input', text: 'Esta semana, mi mayor victoria emocional fue' },
      { type: 'input', text: 'La próxima semana, quiero trabajar en' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Me siento orgulloso de haber completado 7 días porque' },
      { type: 'input', text: 'Un hábito positivo que ya noto es' },
      { type: 'input', text: 'Tres bendiciones de esta semana:\n1.\n2.\n3.' },
      { type: 'input', text: 'Mensaje para mi yo del futuro de la próxima semana:' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 8,
    morning: [
      { type: 'input', text: '¿Qué parte de mi vida necesita más atención ahora?' },
      { type: 'input', text: '¿Qué me impide dársela?' },
      { type: 'input', text: 'Un pequeño paso que daré hoy hacia eso es' },
      { type: 'input', text: 'Hoy elijo soltar el control sobre' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿Cuándo hoy me juzgué duramente?' },
      { type: 'input', text: '¿Cuándo me sentí más presente hoy?' },
      { type: 'input', text: '¿Qué me ancló en ese momento?' },
      { type: 'input', text: 'Una emoción difícil que sentí hoy fue y la honro porque' },
      { type: 'input', text: 'Me siento en paz con' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 9,
    morning: [
      { type: 'input', text: '¿Qué historia me estoy contando sobre mí mismo últimamente?' },
      { type: 'input', text: '¿Es verdad? ¿Me sirve?' },
      { type: 'input', text: 'La historia que ELIJO creer es' },
      { type: 'input', text: 'Hoy me comprometo a' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy me sorprendí cuando' },
      { type: 'input', text: 'Una forma en que fui amable (conmigo o con otros) fue' },
      { type: 'input', text: 'Me doy permiso para no ser perfecto en' },
      { type: 'input', text: 'Gratitud profunda por:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 10,
    morning: [
      { type: 'input', text: '¿Qué necesito escuchar de mí mismo hoy?' },
      { type: 'input', text: 'Si mi intuición pudiera hablar, me diría' },
      { type: 'input', text: 'Hoy honraré mi energía al' },
      { type: 'input', text: 'Me siento feliz haciendo' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿Qué límite establecí (o necesito establecer) hoy?' },
      { type: 'input', text: '¿Cómo me sentí al respecto?' },
      { type: 'input', text: 'Algo que me hizo reír o sonreír hoy fue' },
      { type: 'input', text: 'Antes de dormir, suelto' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 11,
    morning: [
      { type: 'input', text: '¿De qué tengo miedo últimamente?' },
      { type: 'input', text: '¿En que me frena ese miedo?' },
      { type: 'input', text: '¿Qué haría si no tuviera miedo?' },
      { type: 'input', text: 'Hoy me comprometo a dar un paso pequeño hacia ese "qué haría":' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy fui fiel a mí mismo cuando' },
      { type: 'input', text: 'Algo que me nutrio hoy fue' },
      { type: 'input', text: 'Me doy crédito por' },
      { type: 'input', text: 'Tres cosas simples que me trajeron alegría:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 12,
    morning: [
      { type: 'input', text: '¿Qué relación en mi vida necesita atención?' },
      { type: 'input', text: '¿Qué puedo hacer hoy para nutrirla?' },
      { type: 'input', text: 'Hoy me comunicaré desde el amor, no desde el miedo, cuando' },
      { type: 'input', text: 'Elijo ver lo bueno en' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy expresé gratitud a alguien (o lo haré mañana) por' },
      { type: 'input', text: 'Una conexión significativa que tuve fue' },
      { type: 'input', text: 'Me siento afortunado por tener en mi vida a' },
      { type: 'input', text: 'Me perdono por cualquier palabra o acción que no reflejó mi mejor version hoy. Mañana lo haré mejor. □ Sí, me perdono' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 13,
    morning: [
      { type: 'input', text: '¿Qué aspecto de mi vida me está desafiando más ahora?' },
      { type: 'input', text: '¿Qué fortaleza puedo usar para enfrentarlo?' },
      { type: 'input', text: 'Hoy buscaré apoyo en (persona, actividad, recurso) Confío en que' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Una forma en que fui resiliente hoy fue' },
      { type: 'input', text: '¿Qué me recuerda esto sobre mi fuerza?' },
      { type: 'input', text: 'Aunque fue difícil, estoy orgulloso de' },
      { type: 'input', text: 'Me acuesto sabiendo que' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 14,
    morning: [
      { type: 'info', text: '🌅 MAÑANA - REFLEXIÓN DE 2 SEMANAS' },
      { type: 'input', text: 'En estas dos semanas, he notado que cuando me siento mal, generalmente es porque' },
      { type: 'input', text: 'Y cuando me siento bien, es porque' },
      { type: 'input', text: 'Un patrón que quiero cambiar es' },
      { type: 'input', text: 'Un patrón que quiero fortalecer es' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Mi mayor crecimiento en estas 2 semanas ha sido' },
      { type: 'input', text: 'Una verdad sobre mí que he redescubierto es' },
      { type: 'input', text: 'Me comprometo a los próximos 14 días a' },
      { type: 'input', text: 'Estoy orgulloso de mí por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 15,
    morning: [
      { type: 'info', text: '🌅 MAÑANA - ¡Punto Medio!' },
      { type: 'input', text: '¡Estás a mitad de camino! ¿Cómo te sientes al respecto?' },
      { type: 'input', text: '¿Qué ha cambiado en ti desde el Día 1?' },
      { type: 'input', text: '¿Qué quieres enfatizar en los próximos 15 días?' },
      { type: 'input', text: 'Hoy celebro' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'El mayor regalo que me ha dado esta experiencia hasta ahora es' },
      { type: 'input', text: 'Una pregunta que sigue apareciendo en mi mente es' },
      { type: 'input', text: '¿Qué respuesta siento que ya tengo dentro de mí?' },
      { type: 'input', text: 'Gratitud infinita por:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 16,
    morning: [
      { type: 'input', text: '¿Qué sueño o meta he estado postergando?' },
      { type: 'input', text: '¿Qué me impide empezar?' },
      { type: 'input', text: 'Hoy me comprometo a dar un paso (aunque sea pequeñísimo) hacia eso:' },
      { type: 'input', text: 'Merezco perseguir esto porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: '¿Di ese paso? □ Sí □ No\nSi sí: ¿Cómo me sentí? Si no: ¿Qué aprendí? ¿Lo intentaré mañana?' },
      { type: 'input', text: 'Hoy me sentí más vivo cuando' },
      { type: 'input', text: 'Me acuesto en paz porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 17,
    morning: [
      { type: 'input', text: '¿Qué parte de mi rutina diaria me drena energía?' },
      { type: 'input', text: '¿Puedo cambiarla? □ Sí □ No\nSi sí: ¿Cómo? Si no: ¿Cómo puedo cambiar mi perspectiva sobre ella?' },
      { type: 'input', text: 'Hoy protegeré mi energía al' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Una forma en que fui intencional con mi energía hoy fue' },
      { type: 'input', text: 'Algo que absorbió mi energía innecesariamente fue' },
      { type: 'input', text: 'Mañana, en vez de eso, haré' },
      { type: 'input', text: 'Gracias por:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 18,
    morning: [
      { type: 'input', text: '¿Qué verdad he estado evitando?' },
      { type: 'input', text: '¿Qué pasaría si la acepto?' },
      { type: 'input', text: 'Hoy tengo el coraje de' },
      { type: 'input', text: 'Confío en el proceso de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy me enfrenté a algo difícil cuando' },
      { type: 'input', text: 'Estoy orgulloso de cómo lo manejé porque' },
      { type: 'input', text: 'Una nueva fortaleza que descubrí en mí es' },
      { type: 'input', text: 'Me honro por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 19,
    morning: [
      { type: 'input', text: '¿Qué necesita sanar en mí?' },
      { type: 'input', text: '¿Qué acto de amor propio puedo hacer hoy?' },
      { type: 'input', text: 'Hoy seré paciente conmigo en' },
      { type: 'input', text: 'Me trato con la misma ternura que trataría a' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy practiqué autocompasión cuando' },
      { type: 'input', text: 'Una herida vieja que siento lista para soltar es' },
      { type: 'input', text: 'En su lugar, elijo llevar' },
      { type: 'input', text: 'Me perdono completamente por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 20,
    morning: [
      { type: 'input', text: '¿Qué experiencia reciente me enseñó algo valioso?' },
      { type: 'input', text: '¿Qué aprendí?' },
      { type: 'input', text: '¿Cómo aplicaré esta sabiduría hoy?' },
      { type: 'input', text: 'Confío en mi camino porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy crecí cuando' },
      { type: 'input', text: 'Una perspectiva que cambió en mí fue' },
      { type: 'input', text: 'Me siento diferente a como era hace 20 días en' },
      { type: 'input', text: 'Gratitud por este proceso de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 21,
    morning: [
      { type: 'info', text: '🌅 MAÑANA - REFLEXIÓN DE 3 SEMANAS' },
      { type: 'input', text: 'Tres palabras que describen estas 3 semanas:\n1. 2. 3.' },
      { type: 'input', text: 'Mi mayor transformación hasta ahora ha sido' },
      { type: 'input', text: 'Algo que ahora veo con más claridad es' },
      { type: 'input', text: 'En la última semana de este viaje, me enfoco en' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Este proceso me ha ayudado a' },
      { type: 'input', text: 'Un hábito que quiero mantener después de los 30 días es' },
      { type: 'input', text: 'Me siento agradecido conmigo mismo por' },
      { type: 'input', text: 'Las próximas 9 días serán poderosas porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 22,
    morning: [
      { type: 'input', text: '¿Qué conversación he estado evitando?' },
      { type: 'input', text: '¿Qué temo que pase si la tengo?' },
      { type: 'input', text: '¿Qué podría ganar si la tengo?' },
      { type: 'input', text: 'Hoy me comunico desde mi verdad auténtica. □ Sí, estoy listo' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy expresé mi verdad cuando' },
      { type: 'input', text: 'Me sentí (honra cualquier emoción que vino)' },
      { type: 'input', text: 'Aprendí que' },
      { type: 'input', text: 'Me siento orgulloso de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 23,
    morning: [
      { type: 'input', text: '¿Qué me trae verdadera alegría?' },
      { type: 'input', text: '¿Cuándo fue la última vez que lo hice?' },
      { type: 'input', text: 'Hoy me regalo tiempo para' },
      { type: 'input', text: 'La alegría es mi derecho natural. Hoy la elijo. □ Sí, la elijo' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Un momento de alegría pura hoy fue' },
      { type: 'input', text: '¿Qué lo hizo especial?' },
      { type: 'input', text: 'Mañana buscaré alegría en' },
      { type: 'input', text: 'Mi corazón está lleno de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 24,
    morning: [
      { type: 'input', text: '¿Qué creencia sobre mí mismo está lista para evolucionar?' },
      { type: 'input', text: 'La nueva verdad que elijo es' },
      { type: 'input', text: 'Hoy actuaré desde esta nueva creencia al' },
      { type: 'input', text: 'Me convierto en quien quiero ser cuando' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy actué como mi mejor versión cuando' },
      { type: 'input', text: 'Me sentí alineado con mi verdadero yo cuando' },
      { type: 'input', text: 'Estoy evolucionando hacia' },
      { type: 'input', text: 'Tres cosas hermosas de hoy:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 25,
    morning: [
      { type: 'input', text: '¿Qué necesito soltar para avanzar?' },
      { type: 'input', text: '¿Qué me miedo perder si lo suelto?' },
      { type: 'input', text: '¿Qué ganaré cuando lo suelte?' },
      { type: 'input', text: 'Hoy practico el arte de dejar ir' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy solté un poco de' },
      { type: 'input', text: 'Me siento (más ligero, asustado, libre, triste, en paz)' },
      { type: 'input', text: 'Confío en que al soltar, creo espacio para' },
      { type: 'input', text: 'Me honro por mi valentía de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 26,
    morning: [
      { type: 'input', text: '¿A quién necesito perdonar (incluyéndome a mí)?' },
      { type: 'input', text: 'Perdonar no significa olvidar o justificar. Significa liberar MI paz de su influencia. □ Entiendo esto' },
      { type: 'input', text: 'Hoy doy un paso hacia el perdón al' },
      { type: 'input', text: 'El perdón es un regalo que me doy a mí mismo. □ Sí, lo es' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy elegí el perdón sobre el resentimiento cuando' },
      { type: 'input', text: '¿Cómo se sintió en mi cuerpo?' },
      { type: 'input', text: 'El perdón me libera porque' },
      { type: 'input', text: 'Gracias por la lección de' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 27,
    morning: [
      { type: 'input', text: '¿Qué fortaleza mía he subestimado?' },
      { type: 'input', text: '¿Cuándo la he usado sin darme cuenta?' },
      { type: 'input', text: 'Hoy usaré conscientemente esta fortaleza para' },
      { type: 'input', text: 'Soy más fuerte de lo que creo porque' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy mi fortaleza brilló cuando' },
      { type: 'input', text: 'Me sorprendí a mí mismo cuando' },
      { type: 'input', text: 'Reconozco en mí la capacidad de' },
      { type: 'input', text: 'Soy capaz. Soy fuerte. Soy suficiente. □ Sí, lo soy' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 28,
    morning: [
      { type: 'info', text: '🌅 MAÑANA - LA RECTA FINAL' },
      { type: 'input', text: 'Solo faltan 3 días. ¿Cómo me siento al respecto?' },
      { type: 'input', text: '¿Qué quiero asegurarme de procesar antes del Día 30?' },
      { type: 'input', text: 'Hoy me doy permiso para' },
      { type: 'input', text: 'Estos últimos días son para' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'Hoy me sentí presente cuando' },
      { type: 'input', text: 'Una verdad profunda sobre mí que he confirmado es' },
      { type: 'input', text: 'Me siento en paz con' },
      { type: 'input', text: 'Gratitud infinita por:\n1.\n2.\n3.' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 29,
    morning: [
      { type: 'input', text: '¿Qué quiero llevarme de estos 30 días?' },
      { type: 'input', text: '¿Qué práctica de esta experiencia continuaré?' },
      { type: 'input', text: '¿Cómo seré diferente después de mañana?' },
      { type: 'input', text: 'Le agradezco a este proceso por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'input', text: 'La lección más importante de este viaje fue' },
      { type: 'input', text: 'El momento más transformador fue cuando' },
      { type: 'input', text: 'Me siento orgulloso de haber' },
      { type: 'input', text: 'Mañana cierro este capítulo, pero abro otro donde' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  },
  {
    day: 30,
    morning: [
      { type: 'info', text: '🌅 MAÑANA FINAL - ¡Lo lograste!' },
      { type: 'input', text: '¡Lo lograste! ¿Cómo te sientes en este momento?' },
      { type: 'input', text: 'Compara: ¿Quién eras el Día 1 vs quién eres hoy?\nDía 1:  Día 30: ' },
      { type: 'input', text: '¿Qué descubriste sobre ti que no sabías?' },
      { type: 'input', text: 'Tu mayor transformación fue' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ],
    night: [
      { type: 'info', text: '🌙 NOCHE FINAL' },
      { type: 'input', text: 'Carta a tu yo del futuro:\n"Yo del futuro, hace 30 días empecé este viaje... Aprendí que... Quiero que recuerdes siempre que... Nunca olvides que eres capaz de... Con amor y orgullo, Tu yo del pasado"' },
      { type: 'input', text: 'Las 3 verdades más importantes que me llevo:\n1.\n2.\n3.' },
      { type: 'input', text: 'Mi compromiso conmigo mismo ahora es' },
      { type: 'input', text: 'Gratitud final por' },
      { type: 'breathing', text: 'RESPIRACION CONSCIENTE', inhale: 4, hold: 4, exhale: 6, hold2: 2, repeat: 3 }
    ]
  }
];
